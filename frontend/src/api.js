const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000/api';

export async function post(path, data) {
  try {
    const res = await fetch(API_BASE + path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    
    const contentType = res.headers.get("content-type");
    if (contentType && contentType.indexOf("application/json") !== -1) {
      return await res.json();
    } else {
      const text = await res.text();
      return { error: text || res.statusText };
    }
  } catch (err) {
    console.error(`POST ${path} failed:`, err);
    return { error: 'Network error or server unreachable' };
  }
}

export async function get(path) {
  try {
    const res = await fetch(API_BASE + path);
    
    const contentType = res.headers.get("content-type");
    if (contentType && contentType.indexOf("application/json") !== -1) {
      return await res.json();
    } else {
      const text = await res.text();
      return { error: text || res.statusText };
    }
  } catch (err) {
    console.error(`GET ${path} failed:`, err);
    return { error: 'Network error or server unreachable' };
  }
}

export async function del(path) {
  try {
    const res = await fetch(API_BASE + path, {
      method: 'DELETE',
    });

    if (res.status === 204) return { message: 'Deleted successfully' };
    
    const contentType = res.headers.get("content-type");
    if (contentType && contentType.indexOf("application/json") !== -1) {
      return await res.json();
    } else {
      const text = await res.text();
      return { error: text || res.statusText };
    }
  } catch (err) {
    console.error(`DELETE ${path} failed:`, err);
    return { error: 'Network error or server unreachable' };
  }
}
