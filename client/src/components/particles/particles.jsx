import { useEffect } from 'react';
import './particles.css';

const ParticleEffect = () => {
  useEffect(() => {
    const createParticle = e => {
      const particle = document.createElement('span');
      particle.className = 'particle';

      document.body.appendChild(particle);

      const size = Math.random() * 8 + 4;
      particle.style.width = size + 'px';
      particle.style.height = size + 'px';

      particle.style.left = e.clientX + 'px';
      particle.style.top = e.clientY + 'px';

      setTimeout(() => {
        particle.remove();
      }, 800);
    };

    window.addEventListener('mousemove', createParticle);

    return () => window.removeEventListener('mousemove', createParticle);
  }, []);

  return null;
};

export default ParticleEffect;
