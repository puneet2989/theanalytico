import { connect } from 'cloudflare:sockets';

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
    if (!env.SMTP_USER) {
      return jsonResponse(
        { ok: false, error: 'misconfigured' },
        500,
        acceptsJson,
        'SMTP_USER'
      );
    }
    if (!env.SMTP_PASS) {
      return jsonResponse(
        { ok: false, error: 'misconfigured' },
        500,
        acceptsJson,
        'SMTP_PASS'
      );
    }

    // Build plain text email body
    const emailBody = `Name: ${name}
Email: ${email}
Phone: ${phone || '(not provided)'}
Business: ${business || '(not provided)'}
Service needed: ${service}
Message: ${message}`;

    // Send email via raw SMTP to Purelymail, same approach as ardlens'
    // worker.js: Workers cannot send email natively, and this project's info@
    // mailbox is already on Purelymail, so this sends directly to the mailbox
    // over cloudflare:sockets rather than going through a third-party email
    // API (Resend, previously) that needed its own account and domain
    // verification.
    const smtpHost = env.SMTP_HOST || 'smtp.purelymail.com';
    const smtpPort = parseInt(env.SMTP_PORT || '465', 10);
    const mailTo = env.MAIL_TO || env.SMTP_USER;
    const subject = `New enquiry from ${name} — ${service}`;

    const headers =
      `From: "${sanitizeHeader(name)} (website)" <${env.SMTP_USER}>\r\n` +
      `To: ${mailTo}\r\n` +
      `Reply-To: ${sanitizeHeader(email)}\r\n` +
      `Subject: ${sanitizeHeader(subject)}\r\n` +
      `MIME-Version: 1.0\r\n` +
      `Content-Type: text/plain; charset=utf-8\r\n` +
      `Date: ${new Date().toUTCString()}\r\n\r\n`;

    const fullMessage = headers + dotStuff(emailBody.replace(/\n/g, '\r\n'));

    try {
      await sendSmtp({
        host: smtpHost,
        port: smtpPort,
        user: env.SMTP_USER,
        pass: env.SMTP_PASS,
        from: env.SMTP_USER,
        to: mailTo,
        fullMessage
      });
    } catch (e) {
      console.error('SMTP send error:', e.message || String(e));
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

function sanitizeHeader(value) {
  return value.replace(/[\r\n]+/g, ' ').trim();
}

function dotStuff(text) {
  return text
    .split('\r\n')
    .map((line) => (line.startsWith('.') ? '.' + line : line))
    .join('\r\n');
}

async function sendSmtp({ host, port, user, pass, from, to, fullMessage }) {
  const socket = connect({ hostname: host, port }, { secureTransport: 'on' });
  const writer = socket.writable.getWriter();
  const reader = socket.readable.getReader();
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  const expect = async (wanted) => {
    const { code, text } = await readReply(reader, decoder);
    if (code !== wanted) {
      throw new Error(`expected ${wanted}, got ${code} (${text.trim()})`);
    }
  };
  const cmd = async (line, wanted) => {
    await writer.write(encoder.encode(line + '\r\n'));
    await expect(wanted);
  };

  try {
    await expect(220);
    await cmd(`EHLO theanalytico.com`, 250);
    await cmd(`AUTH LOGIN`, 334);
    await cmd(btoa(user), 334);
    await cmd(btoa(pass), 235);
    await cmd(`MAIL FROM:<${from}>`, 250);
    await cmd(`RCPT TO:<${to}>`, 250);
    await cmd(`DATA`, 354);
    await writer.write(encoder.encode(fullMessage + '\r\n.\r\n'));
    await expect(250);
    await writer.write(encoder.encode('QUIT\r\n'));
  } finally {
    try {
      await writer.close();
    } catch (e) {
      /* socket already closing */
    }
    try {
      reader.releaseLock();
    } catch (e) {
      /* already released */
    }
  }
}

async function readReply(reader, decoder) {
  let buffer = '';
  while (true) {
    const { value, done } = await reader.read();
    if (value) buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\r\n').filter(Boolean);
    const last = lines[lines.length - 1];
    if (last && /^\d{3} /.test(last)) {
      return { code: parseInt(last.slice(0, 3), 10), text: buffer };
    }
    if (done) return { code: 0, text: buffer };
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
