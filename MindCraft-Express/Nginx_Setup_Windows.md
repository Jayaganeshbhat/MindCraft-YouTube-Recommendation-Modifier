# Setting up Nginx with HTTPS on Windows (Manual Install)

This guide walks you through installing **Nginx manually on Windows** and setting up a **self-signed SSL certificate** for `https://localhost`.

---

## 1. Install Nginx Manually

### **1. Download**
Go to: [https://nginx.org/en/download.html](https://nginx.org/en/download.html)

Download the **Stable** or **Mainline** version ZIP (e.g. `nginx-1.29.3.zip`).

### **2. Extract**
Extract it to:
```
C:\nginx
```

### **3. Run Nginx**
```bash
cd C:\nginx
start nginx
```
Visit: [http://localhost](http://localhost)

To stop:
```bash
nginx -s stop
```
To reload config:
```bash
nginx -s reload
```

---

## 2. Add Custom Config (mindcraft.conf)

Create a new config file:
```
C:\nginx\conf\mindcraft.conf
```

Keep it empty for now. We will add our custom config later.

Then test and reload:
```bash
cd C:\nginx
nginx -t
nginx -s reload
```

---

## 3. Add HTTPS with Self-Signed Certificate

### **Step 1 — Generate Certs using OpenSSL**
```bash
cd C:\nginx\conf
mkdir ssl
cd ssl

openssl req -x509 -nodes -days 365 -newkey rsa:2048 ^
 -keyout localhost.key -out localhost.crt ^
 -subj "/C=US/ST=Local/L=Local/O=Dev/OU=Dev/CN=localhost"
```

This generates:
```
localhost.crt
localhost.key
```

### **Step 2 — Trust the Certificate**
- Double-click `localhost.crt`
- Choose **Install Certificate**
- Select **Local Machine**
- Store in **Trusted Root Certification Authorities**
- Click **Finish** → Accept the warning

`https://localhost` will now be trusted in browsers.

### **Step 3 — Update Nginx Config**
Replace the contents of `C:\nginx\conf\mindcraft.conf` with `mindcraft.conf`

Then test and reload:
```bash
nginx -t
nginx -s reload
```

Now visit [https://localhost](https://localhost)

---

## Common Commands

| Action | Command |
|--------|----------|
| Test config | `nginx -t` |
| Reload config | `nginx -s reload` |
| Stop server | `nginx -s stop` |
| Start server | `start nginx` |

---

**You now have HTTPS Nginx on Windows with your custom mindcraft.conf!** 🔥
