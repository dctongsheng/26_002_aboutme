// ==================== DOM 元素 ====================
const navLinks = document.querySelectorAll('.nav-link');
const sections = document.querySelectorAll('.section, .hero');
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');
const terminalBody = document.querySelector('.terminal-body');
const cursor = document.querySelector('.cursor');

// ==================== 导航高亮 ====================
function highlightNav() {
    let current = '';
    const scrollPosition = window.scrollY + 100;

    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;

        if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        const href = link.getAttribute('href');
        if (href === `#${current}`) {
            link.classList.add('active');
        }
    });
}

// ==================== 平滑滚动 ====================
navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('href');
        const targetSection = document.querySelector(targetId);

        if (targetSection) {
            const offsetTop = targetSection.offsetTop - 70;
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });

            // 移动端关闭菜单
            if (window.innerWidth <= 768) {
                navMenu.classList.remove('active');
                hamburger.classList.remove('active');
            }
        }
    });
});

// ==================== 移动端菜单 ====================
hamburger.addEventListener('click', () => {
    navMenu.classList.toggle('active');
    hamburger.classList.toggle('active');
});

// ==================== 打字机效果 ====================
const terminalTexts = [
    'npm install hebox',
    'npm install xhshebox',
    '构建 Agent 应用...',
    '提高工作效率...',
    '解放思想...',
    'AI 改变生活...'
];

let textIndex = 0;
let charIndex = 0;
let isDeleting = false;

function typeWriter() {
    const currentText = terminalTexts[textIndex];

    if (isDeleting) {
        terminalBody.innerHTML = `<span class="prompt">$</span> ${currentText.substring(0, charIndex - 1)}<span class="cursor"></span>`;
        charIndex--;
    } else {
        terminalBody.innerHTML = `<span class="prompt">$</span> ${currentText.substring(0, charIndex + 1)}<span class="cursor"></span>`;
        charIndex++;
    }

    let typeSpeed = isDeleting ? 50 : 100;

    if (!isDeleting && charIndex === currentText.length) {
        typeSpeed = 2000;
        isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        textIndex = (textIndex + 1) % terminalTexts.length;
        typeSpeed = 500;
    }

    setTimeout(typeWriter, typeSpeed);
}

// ==================== 滚动动画 ====================
function handleScrollAnimation() {
    const elements = document.querySelectorAll('.product-card, .about-card, .skills-section, .contact-link');

    elements.forEach(element => {
        const elementTop = element.getBoundingClientRect().top;
        const windowHeight = window.innerHeight;

        if (elementTop < windowHeight - 100) {
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        }
    });
}

// 初始化滚动动画
function initScrollAnimation() {
    const elements = document.querySelectorAll('.product-card, .about-card, .skills-section, .contact-link');

    elements.forEach(element => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(30px)';
        element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    });
}

// ==================== 粒子背景效果（可选） ====================
function createParticles() {
    const particlesContainer = document.querySelector('.bg-particles');

    for (let i = 0; i < 50; i++) {
        const particle = document.createElement('div');
        particle.style.cssText = `
            position: absolute;
            width: ${Math.random() * 3 + 1}px;
            height: ${Math.random() * 3 + 1}px;
            background: rgba(0, 255, 159, ${Math.random() * 0.5 + 0.2});
            border-radius: 50%;
            left: ${Math.random() * 100}%;
            top: ${Math.random() * 100}%;
            animation: particle-float ${Math.random() * 10 + 10}s linear infinite;
        `;
        particlesContainer.appendChild(particle);
    }

    // 添加粒子动画样式
    const style = document.createElement('style');
    style.textContent = `
        @keyframes particle-float {
            0%, 100% {
                transform: translate(0, 0);
                opacity: 0;
            }
            10% {
                opacity: 1;
            }
            90% {
                opacity: 1;
            }
            100% {
                transform: translate(${Math.random() * 200 - 100}px, ${Math.random() * 200 - 100}px);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
}

// ==================== 技能标签随机动画 ====================
function animateSkills() {
    const skillTags = document.querySelectorAll('.skill-tag');

    skillTags.forEach((tag, index) => {
        tag.style.animationDelay = `${index * 0.1}s`;
    });
}

// ==================== 页面加载事件 ====================
window.addEventListener('load', () => {
    // 启动打字机效果
    setTimeout(typeWriter, 1000);

    // 初始化滚动动画
    initScrollAnimation();

    // 创建粒子效果
    createParticles();

    // 技能标签动画
    animateSkills();

    // 初始高亮导航
    highlightNav();
});

// ==================== 滚动事件 ====================
window.addEventListener('scroll', () => {
    highlightNav();
    handleScrollAnimation();
});

// ==================== 窗口大小改变事件 ====================
window.addEventListener('resize', () => {
    highlightNav();
});

// ==================== 产品卡片 3D 效果（可选） ====================
document.querySelectorAll('.product-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = (y - centerY) / 20;
        const rotateY = (centerX - x) / 20;

        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-5px)`;
    });

    card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0)';
    });
});

// ==================== 控制台彩蛋 ====================
console.log('%c🎮 豆哥的网站', 'font-size: 24px; font-weight: bold; color: #00ff9f;');
console.log('%c欢迎来到我的个人网站！', 'font-size: 14px; color: #00d4ff;');
console.log('%c如果你对代码感兴趣，欢迎联系我！', 'font-size: 12px; color: #bd00ff;');
console.log('%c⚡ Powered by AI & Coffee', 'font-size: 10px; color: #606670;');
