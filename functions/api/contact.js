export async function onRequestPost(context) {
  const { request, env } = context;

  // Detect native form submission (no Accept: application/json)
  const acceptsJson = request.headers.get('accept')?.includes('application/json');

  try {
    // Check content type
    const contentType = request.headers.get('content-type') || '';
    const isFormData = contentType.includes('application/x-www-form-urlencoded');
    const isJson = contentType.includes('application/json');
    const isMultipart = contentType.includes('multipart/form-data');

    if (!isFormData && !isJson && !isMultipart) {
      return jsonResponse(
        { ok: false, error: 'bad_content_type' },
        415,
        acceptsJson
      );
    }

    // Check body size
    const bodySize = request.headers.get('content-length');
    if (bodySize && parseInt(bodySize) > 16384) {
      return jsonResponse(
        { ok: false, error: 'too_large' },
        413,
        acceptsJson
      );
    }

    // Parse request body
    let data;
    try {
      if (isFormData) {
        const formData = await request.formData();
        data = Object.fromEntries(formData);
      } else if (isJson) {
        data = await request.json();
      } else if (isMultipart) {
        const formData = await request.formData();
        data = Object.fromEntries(formData);
      }
    } catch (e) {
      return jsonResponse(
        { ok: false, error: 'bad_request' },
        400,
        acceptsJson
      );
    }

    // Verify Turnstile token before any other work
    const turnstileResponse = String(data['cf-turnstile-response'] || '').trim();

    const turnstileVerified = await verifyTurnstile(
      turnstileResponse,
      env.TURNSTILE_SECRET_KEY,
      request.headers.get('CF-Connecting-IP')
    );

    if (!turnstileVerified) {
      return jsonResponse(
        { ok: false, error: 'turnstile_failed' },
        403,
        acceptsJson
      );
    }

    // Validate all fields
    const validation = validateFields(data);
    if (!validation.valid) {
      return jsonResponse(
        { ok: false, error: 'validation_failed', fields: validation.errors },
        400,
        acceptsJson
      );
    }

    // Extract validated data
    const name = String(data.name || '').trim();
    const email = String(data.email || '').trim();
    const phone = String(data.phone || '').trim();
    const business = String(data.business || '').trim();
    const service = String(data.service || '').trim();
    const message = String(data.message || '').trim();
    const consent = String(data.consent || '').trim();

    // Check rate limit
    const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
    const rateLimitKey = `contact:${ip}`;

    if (env.RATE_LIMIT) {
      try {
        const count = await env.RATE_LIMIT.get(rateLimitKey);
        const current = count ? parseInt(count) + 1 : 1;

        if (current > 5) {
          return jsonResponse(
            { ok: false, error: 'rate_limited' },
            429,
            acceptsJson
          );
        }

        // Update counter with 3600 second expiration
        await env.RATE_LIMIT.put(rateLimitKey, String(current), { expirationTtl: 3600 });
      } catch (e) {
        console.warn('Rate limit check failed, continuing');
      }
    }

    // Check required environment variables
    if (!env.TURNSTILE_SECRET_KEY) {
      return jsonResponse(
        { ok: false, error: 'misconfigured' },
        500,
        acceptsJson,
        'TURNSTILE_SECRET_KEY'
      );
    }
    if (!env.RESEND_API_KEY) {
      return jsonResponse(
        { ok: false, error: 'misconfigured' },
        500,
        acceptsJson,
        'RESEND_API_KEY'
      );
    }
    if (!env.CONTACT_FROM_EMAIL) {
      return jsonResponse(
        { ok: false, error: 'misconfigured' },
        500,
        acceptsJson,
        'CONTACT_FROM_EMAIL'
      );
    }
    if (!env.CONTACT_TO_EMAIL) {
      return jsonResponse(
        { ok: false, error: 'misconfigured' },
        500,
        acceptsJson,
        'CONTACT_TO_EMAIL'
      );
    }

    // Build plain text email body
    const emailBody = `Name: ${name}
Email: ${email}
Phone: ${phone || '(not provided)'}
Business: ${business || '(not provided)'}
Service needed: ${service}
Message: ${message}
Consent: ${consent === 'yes' ? 'Given' : 'Not given'}`;

    // Send email via Resend
    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: env.CONTACT_FROM_EMAIL,
        to: env.CONTACT_TO_EMAIL,
        reply_to: email,
        subject: `New enquiry from ${name} — ${service}`,
        text: emailBody
      })
    });

    if (!resendResponse.ok) {
      const errorData = await resendResponse.json().catch(() => ({}));
      console.error(`Resend API error: ${resendResponse.status}`, errorData.id || '');
      return jsonResponse(
        { ok: false, error: 'send_failed' },
        502,
        acceptsJson
      );
    }

    // Success
    if (!acceptsJson) {
      return new Response(null, {
        status: 303,
        headers: { 'Location': '/contact?sent=1' }
      });
    }

    return jsonResponse({ ok: true }, 200, true);

  } catch (e) {
    console.error('Unhandled error:', e.message || String(e));
    return jsonResponse(
      { ok: false, error: 'bad_request' },
      400,
      acceptsJson
    );
  }
}

function validateFields(data) {
  const errors = [];

  // name: present, trimmed length 1 to 100
  const name = String(data.name || '').trim();
  if (!name || name.length < 1 || name.length > 100) {
    errors.push('name');
  }

  // email: present, trimmed length 5 to 254, email format
  const email = String(data.email || '').trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  if (!email || email.length < 5 || email.length > 254 || !emailRegex.test(email)) {
    errors.push('email');
  }

  // phone: optional, trimmed length 0 to 30
  const phone = String(data.phone || '').trim();
  if (phone.length > 30) {
    errors.push('phone');
  }

  // business: optional, trimmed length 0 to 120
  const business = String(data.business || '').trim();
  if (business.length > 120) {
    errors.push('business');
  }

  // service: present, one of 5 values
  const service = String(data.service || '').trim();
  const validServices = ['web-design', 'seo', 'paid-advertising', 'ai-services', 'not-sure'];
  if (!service || !validServices.includes(service)) {
    errors.push('service');
  }

  // message: present, trimmed length 10 to 2000
  const message = String(data.message || '').trim();
  if (!message || message.length < 10 || message.length > 2000) {
    errors.push('message');
  }

  // Check for > 5 URLs in message
  const urlMatches = (message.match(/https?:\/\//g) || []).length;
  if (urlMatches > 5) {
    errors.push('message');
  }

  // consent: present, equals 'yes'
  const consent = String(data.consent || '').trim();
  if (consent !== 'yes') {
    errors.push('consent');
  }

  // cf-turnstile-response: present, non-empty
  const turnstile = String(data['cf-turnstile-response'] || '').trim();
  if (!turnstile) {
    errors.push('cf-turnstile-response');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

async function verifyTurnstile(token, secret, remoteIp) {
  try {
    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        secret,
        response: token,
        remoteip: remoteIp || ''
      })
    });

    if (!response.ok) {
      return false;
    }

    const data = await response.json();
    return data.success === true;
  } catch (e) {
    console.error('Turnstile verification error:', e.message);
    return false;
  }
}

function jsonResponse(body, status = 200, acceptsJson = true, missingVar = null) {
  if (!acceptsJson) {
    if (status >= 400) {
      return new Response(null, {
        status: 303,
        headers: { 'Location': '/contact?error=1' }
      });
    } else {
      return new Response(null, {
        status: 303,
        headers: { 'Location': '/contact?sent=1' }
      });
    }
  }

  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store'
    }
  });
}
