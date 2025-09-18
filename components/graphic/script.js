// // script.js
// export function mount(root, { host, shadow }) {
//   // 1) 모달 뼈대가 없으면 섹션(root) 안에 생성
//   let modal = root.querySelector('.modal');
//   if (!modal) {
//     root.insertAdjacentHTML('beforeend', `
//       <div class="modal" id="image-modal" aria-hidden="true" role="dialog" aria-modal="true">
//         <div class="modal__backdrop" data-close></div>
//         <div class="modal__panel" role="document">
//           <button class="modal__close" type="button" aria-label="닫기" data-close>&times;</button>
//           <div class="modal__scroll">
//             <div class="poster-modal">
//               <img src="/public/assets/images/poster1.png" alt="">
//               <img src="/public/assets/images/poster2.png" alt="">
//             </div>
//             <div class="album-modal">
//               <img src="/public/assets/images/album_cover.png" alt="">
//             </div>
//           </div>
//         </div>
//       </div>
//     `);
//     modal = root.querySelector('.modal');
//   }

//   const posterModal = modal.querySelector('.poster-modal');
//   const albumModal  = modal.querySelector('.album-modal');

//   // 2) 바디 스크롤 잠금 (전역은 여기만 필요)
//   let scrollY = 0;
//   function lockBody() {
//     scrollY = window.scrollY || document.documentElement.scrollTop;
//     document.body.style.position = 'fixed';
//     document.body.style.top = `-${scrollY}px`;
//     document.body.style.width = '100%';
//   }
//   function unlockBody() {
//     document.body.style.position = '';
//     document.body.style.top = '';
//     document.body.style.width = '';
//     window.scrollTo(0, scrollY);
//   }

//   // 3) 섹션-스코프 모달 열고닫기
//   function openModal(which) {
//     if (which === 'poster') {
//       posterModal.classList.add('active');
//       albumModal.classList.remove('active');
//     } else if (which === 'album') {
//       albumModal.classList.add('active');
//       posterModal.classList.remove('active');
//     }
//     modal.classList.add('is-open');
//     modal.setAttribute('aria-hidden', 'false');
//     lockBody();
//   }
//   function closeModal() {
//     modal.classList.remove('is-open');
//     modal.setAttribute('aria-hidden', 'true');
//     posterModal.classList.remove('active');
//     albumModal.classList.remove('active');
//     unlockBody();
//   }

//   // 4) 섹션 내부 이벤트 바인딩 (inline onclick 안 씀!)
//   root.addEventListener('click', (e) => {
//     // 포스터/앨범 원형 카드 클릭 → 해당 모달
//     if (e.target.closest('.poster-container')) {
//       openModal('poster');
//     } else if (e.target.closest('.album-container')) {
//       openModal('album');
//     }
//     // 닫기 (백드롭/버튼)
//     if (e.target.matches('[data-close], .modal__backdrop')) {
//       closeModal();
//     }
//   });

//   // 5) ESC 닫기
//   window.addEventListener('keydown', (e) => {
//     if (e.key === 'Escape' && modal.classList.contains('is-open')) closeModal();
//   });
// }
