// Schmaler API-Client für den „Connected Mode“. Wird der Server erreicht,
// laufen Login und geteilte Daten über die REST-API; andernfalls bleibt die
// App im lokalen Demo-/Offline-Modus (siehe app.js).
(function () {
  'use strict';
  const TOKEN_KEY = 'maestro-plan/token';

  const API = {
    connected: false,
    get token() { try { return localStorage.getItem(TOKEN_KEY); } catch { return null; } },
    set token(v) { try { v ? localStorage.setItem(TOKEN_KEY, v) : localStorage.removeItem(TOKEN_KEY); } catch { /* egal */ } }
  };

  async function request(method, path, body) {
    const headers = { 'Content-Type': 'application/json' };
    if (API.token) headers['Authorization'] = 'Bearer ' + API.token;
    const res = await fetch(path, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body)
    });
    let data = null;
    try { data = await res.json(); } catch { /* leerer Body */ }
    if (!res.ok) {
      const err = new Error((data && data.error) || ('HTTP ' + res.status));
      err.status = res.status;
      throw err;
    }
    return data;
  }

  // Prüft einmalig, ob ein Server auf gleichem Origin antwortet.
  API.detect = async function () {
    try {
      const controller = new AbortController();
      const t = setTimeout(() => controller.abort(), 1500);
      const res = await fetch('api/health', { signal: controller.signal });
      clearTimeout(t);
      API.connected = res.ok;
    } catch {
      API.connected = false;
    }
    return API.connected;
  };

  API.login = async function (email, password) {
    const data = await request('POST', 'api/login', { email, password });
    API.token = data.token;
    return data.state;
  };
  API.logout = async function () {
    try { await request('POST', 'api/logout'); } catch { /* trotzdem lokal abmelden */ }
    API.token = null;
  };
  API.getState = () => request('GET', 'api/state');
  API.getClient = id => request('GET', 'api/clients/' + encodeURIComponent(id));
  API.postMessage = (text, to) => request('POST', 'api/messages', { text, to });
  API.postCheckin = entry => request('POST', 'api/checkins', entry);
  API.patchProgress = patch => request('PATCH', 'api/progress', patch);
  API.putAppointment = appt => request('PUT', 'api/appointment', appt);
  API.deleteAppointment = () => request('DELETE', 'api/appointment');

  window.MaestroAPI = API;
})();
