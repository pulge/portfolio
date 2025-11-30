window.onload = () => {
    const marquee = document.getElementById('marquee') as HTMLElement;

    // Example: Change marquee animation speed based on window size
    const setMarqueeSpeed = () => {
        const width = window.innerWidth;
        const speed = width < 600 ? '15s' : '10s'; // slower speed on smaller screens
        marquee.style.animationDuration = speed;
    };

    setMarqueeSpeed();
    window.addEventListener('resize', setMarqueeSpeed);
};
