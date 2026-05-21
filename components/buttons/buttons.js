document.addEventListener('DOMContentLoaded', () => {
  initButtons();
});

function initButtons(){
  document.querySelectorAll('[data-cc-action]').forEach(btn => {
    const action = btn.dataset.ccAction;

    if(action === 'navigate'){
      btn.addEventListener('click', ()=>{
        const to = btn.dataset.ccTarget || 'index.html';
        window.location.href = to;
      });
    }

    if(action === 'toggle-fav'){
      // initialize state from localStorage
      const id = btn.dataset.ccId || 'default';
      const saved = localStorage.getItem('cc-fav-'+id);
      if(saved === '1') btn.classList.add('active');

      btn.addEventListener('click', ()=>{
        btn.classList.toggle('active');
        const active = btn.classList.contains('active');
        localStorage.setItem('cc-fav-'+id, active ? '1' : '0');
        const label = btn.querySelector('.label');
        if(label) label.textContent = active ? 'Saved' : 'Save';
      });
    }

    if(action === 'open-modal'){
      btn.addEventListener('click', ()=>{
        const title = btn.dataset.ccTitle || 'Notice';
        const message = btn.dataset.ccMessage || '';
        openModal(title, message);
      });
    }
  });
}

function openModal(title, message){
  const backdrop = document.createElement('div');
  backdrop.className = 'cc-modal-backdrop';

  const modal = document.createElement('div');
  modal.className = 'cc-modal';
  modal.innerHTML = `
    <h3>${escapeHtml(title)}</h3>
    <div class="cc-modal-body"><p>${escapeHtml(message)}</p></div>
    <div class="cc-modal-actions">
      <button class="btn btn--secondary" data-cc-close>Close</button>
      <button class="btn btn--primary" data-cc-confirm>Confirm</button>
    </div>
  `;

  backdrop.appendChild(modal);
  document.body.appendChild(backdrop);

  backdrop.addEventListener('click', (e)=>{ if(e.target === backdrop) closeModal(backdrop); });
  modal.querySelector('[data-cc-close]').addEventListener('click', ()=> closeModal(backdrop));
  modal.querySelector('[data-cc-confirm]').addEventListener('click', ()=>{ closeModal(backdrop); alert('Confirmed'); });
}

function closeModal(backdrop){ backdrop.remove(); }

function escapeHtml(str){
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
