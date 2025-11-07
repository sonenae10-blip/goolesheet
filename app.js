// 배포된 Apps Script Web App URL로 바꾸세요. 예: https://script.google.com/macros/s/AKfycbx.../exec
const API_BASE = 'https://script.google.com/macros/s/AKfycbyfd_ZV651wPqxklRr1oqkYBc8L4Pq06s3ZdefU49ivKM7Qcop9PEEzWeK-8ZEDjn3H/exec';

const $ = (sel, el = document) => el.querySelector(sel);

const state = {
  loading: false,
  items: [],
};

function setStatus(msg) {
  $('#status').textContent = msg;
}

async function apiGet(params = {}) {
  const url = new URL(API_BASE);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  const res = await fetch(url.toString(), {
    method: 'GET', // CORS 프리플라이트 회피(단순 요청)
    headers: { 'Accept': 'application/json' },
  });
  return res.json();
}

async function apiPost(params = {}) {
  const body = new URLSearchParams(params);
  const res = await fetch(API_BASE, {
    method: 'POST',
    headers: {
      // 단순 요청을 위해 x-www-form-urlencoded 사용 (프리플라이트 방지)
      'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
      'Accept': 'application/json',
    },
    body,
  });
  return res.json();
}

function render() {
  const list = $('#list');
  list.innerHTML = '';
  if (!state.items.length) {
    const empty = document.createElement('div');
    empty.className = 'item';
    empty.innerHTML = '<span class="text" style="color:#9ca3af">할 일이 비어 있어요.</span>';
    list.appendChild(empty);
    return;
  }

  for (const item of state.items) {
    const row = document.createElement('div');
    row.className = 'item' + (item.done ? ' done' : '');
    row.dataset.id = item.id;

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = !!item.done;
    checkbox.addEventListener('change', async () => {
      try {
        setStatus('상태 변경 중...');
        const resp = await apiPost({ action: 'toggle', id: item.id });
        if (!resp.ok) throw new Error(resp.error || '토글 실패');
        await load();
      } catch (e) {
        console.error(e);
        alert('완료 상태 변경 실패: ' + e.message);
      } finally {
        setStatus('준비됨');
      }
    });

    const text = document.createElement('div');
    text.className = 'text';
    text.textContent = item.text;

    const actions = document.createElement('div');
    actions.className = 'actions';

    const delBtn = document.createElement('button');
    delBtn.className = 'danger';
    delBtn.textContent = '삭제';
    delBtn.addEventListener('click', async () => {
      if (!confirm('삭제하시겠어요?')) return;
      try {
        setStatus('삭제 중...');
        const resp = await apiPost({ action: 'delete', id: item.id });
        if (!resp.ok) throw new Error(resp.error || '삭제 실패');
        await load();
      } catch (e) {
        console.error(e);
        alert('삭제 실패: ' + e.message);
      } finally {
        setStatus('준비됨');
      }
    });

    actions.appendChild(delBtn);
    row.appendChild(checkbox);
    row.appendChild(text);
    row.appendChild(actions);
    list.appendChild(row);
  }
}

async function load() {
  try {
    state.loading = true;
    setStatus('목록 불러오는 중...');
    const resp = await apiGet({ action: 'list' });
    if (!resp.ok) throw new Error(resp.error || '목록 로드 실패');
    state.items = resp.data || [];
    render();
    setStatus(`총 ${state.items.length}개`);
  } catch (e) {
    console.error(e);
    setStatus('오류 발생');
    alert('목록 로드 실패: ' + e.message);
  } finally {
    state.loading = false;
  }
}

async function add(text) {
  const t = (text || '').trim();
  if (!t) return;
  try {
    setStatus('추가 중...');
    const resp = await apiPost({ action: 'add', text: t });
    if (!resp.ok) throw new Error(resp.error || '추가 실패');
    $('#new-input').value = '';
    await load();
  } catch (e) {
    console.error(e);
    alert('추가 실패: ' + e.message);
  } finally {
    setStatus('준비됨');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  $('#new-form').addEventListener('submit', (e) => {
    e.preventDefault();
    add($('#new-input').value);
  });
  $('#reload-btn').addEventListener('click', load);
  load();
});

