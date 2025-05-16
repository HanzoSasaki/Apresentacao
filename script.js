// script.js

document.addEventListener('DOMContentLoaded', () => {
    // referências
    const sidebar     = document.querySelector('.sidebar');
    const btnToggle   = document.querySelector('.menu-toggle');
    const overlay     = document.getElementById('pageOverlay');
    const navItems    = document.querySelectorAll('.nav-item');
    const passwordModal = document.getElementById('password-modal');
    const usersModal    = document.getElementById('users-modal');
    const senhaInput  = document.getElementById('password-input');
    const errorMsg    = document.getElementById('error-message');
    const contentFrame = document.getElementById('contentFrame');
  
    // --- MENU OFF-CANVAS ---
    function toggleMenu() {
      sidebar.classList.toggle('open');
      btnToggle.classList.toggle('open');
      overlay.classList.toggle('visible');
    }
  
    btnToggle.addEventListener('click', toggleMenu);
    overlay.addEventListener('click', toggleMenu);
  
    // fecha menu ao clicar em qualquer item
    navItems.forEach(item => {
      item.addEventListener('click', () => {
        sidebar.classList.remove('open');
        btnToggle.classList.remove('open');
        overlay.classList.remove('visible');
      });
    });
  
    // --- MODAL DE SENHA ---
    const senhaCorreta   = "0000";
    const tempoBloqueio  = 2 * 60 * 60 * 1000; // 2h
  
    // verifica bloqueio
    let ultimaVerificacao = localStorage.getItem("ultimaVerificacao");
    if (ultimaVerificacao && (Date.now() - ultimaVerificacao < tempoBloqueio)) {
      passwordModal.style.display = "none";
    } else {
      passwordModal.style.display = "flex";
    }
  
    // enter pra submeter
    senhaInput.addEventListener("keyup", e => {
      if (e.key === "Enter") verificarSenha();
    });
  
    window.verificarSenha = function() {
      if (senhaInput.value === senhaCorreta) {
        localStorage.setItem("ultimaVerificacao", Date.now());
        passwordModal.style.display = "none";
      } else {
        errorMsg.textContent = "Senha incorreta! Tente novamente.";
      }
    };
  
    // --- MODAL USUÁRIOS PERMITIDOS ---
    window.abrirModalUsers = () => usersModal.style.display = "flex";
    window.fecharModalUsers = () => usersModal.style.display = "none";
  
    // --- IFRAME & MENU ATIVO ---
    function setActiveMenuItem(url) {
      navItems.forEach(item => {
        const itemPath   = new URL(item.href, location.href).pathname;
        const targetPath = new URL(url, location.href).pathname;
        item.classList.toggle('active', itemPath === targetPath);
      });
    }
  
    navItems.forEach(item => {
      item.addEventListener('click', e => {
        e.preventDefault();
        const url = item.href;
        contentFrame.src = url;
        setActiveMenuItem(url);
      });
    });
  
    // carrega a primeira página
    const firstUrl = navItems[0]?.href;
    if (firstUrl) {
      contentFrame.src = firstUrl;
      setActiveMenuItem(firstUrl);
    }
  
    // atualiza ativo ao trocar iframe
    contentFrame.addEventListener('load', () => {
      try {
        setActiveMenuItem(contentFrame.contentWindow.location.href);
      } catch { /* cross-origin */ }
    });
  });
  