import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Search, GraduationCap, BookOpen, Award, ChevronDown, Sparkles } from 'lucide-react';
import * as THREE from 'three';

const HeroSection = () => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [scrollY, setScrollY] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const containerRef = useRef(null);
  const threeRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const particleSystemRef = useRef(null);
  const graduationCapRef = useRef(null);
  const booksRef = useRef([]);
  const diplomaRef = useRef(null);

  useEffect(() => {
    if (!threeRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    threeRef.current.appendChild(renderer.domElement);

    sceneRef.current = scene;
    rendererRef.current = renderer;
    cameraRef.current = camera;

    // Lighting setup
    const ambientLight = new THREE.AmbientLight(0x4fc3f7, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(10, 10, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);

    const pointLight1 = new THREE.PointLight(0x6366f1, 1, 100);
    pointLight1.position.set(-10, 5, 0);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0xec4899, 0.8, 100);
    pointLight2.position.set(10, -5, 0);
    scene.add(pointLight2);

    // Create 3D Graduation Cap
    const capGeometry = new THREE.CylinderGeometry(2, 2.5, 0.3, 6);
    const capMaterial = new THREE.MeshPhongMaterial({
      color: 0x1e293b,
      shininess: 100,
      transparent: true,
      opacity: 0.9
    });
    const graduationCap = new THREE.Mesh(capGeometry, capMaterial);
    graduationCap.position.set(0, 2, -5);
    graduationCap.castShadow = true;
    graduationCap.receiveShadow = true;
    scene.add(graduationCap);
    graduationCapRef.current = graduationCap;

    // Create cap top (mortarboard)
    const topGeometry = new THREE.BoxGeometry(3, 0.1, 3);
    const topMaterial = new THREE.MeshPhongMaterial({ color: 0x0f172a });
    const capTop = new THREE.Mesh(topGeometry, topMaterial);
    capTop.position.set(0, 2.2, -5);
    capTop.castShadow = true;
    scene.add(capTop);

    // Create tassel
    const tasselGeometry = new THREE.CylinderGeometry(0.05, 0.05, 1.5, 8);
    const tasselMaterial = new THREE.MeshPhongMaterial({ color: 0xfbbf24 });
    const tassel = new THREE.Mesh(tasselGeometry, tasselMaterial);
    tassel.position.set(1.2, 1.5, -5);
    tassel.rotation.z = Math.PI / 6;
    scene.add(tassel);

    // Create floating books
    for (let i = 0; i < 5; i++) {
      const bookGeometry = new THREE.BoxGeometry(0.8, 1.2, 0.1);
      const bookMaterial = new THREE.MeshPhongMaterial({
        color: new THREE.Color().setHSL(Math.random(), 0.7, 0.6),
        shininess: 50
      });
      const book = new THREE.Mesh(bookGeometry, bookMaterial);
      book.position.set(
        (Math.random() - 0.5) * 15,
        (Math.random() - 0.5) * 8,
        -10 - Math.random() * 5
      );
      book.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      );
      book.castShadow = true;
      scene.add(book);
      booksRef.current.push(book);
    }

    // Create diploma scroll
    const diplomaGeometry = new THREE.CylinderGeometry(0.05, 0.05, 2, 8);
    const diplomaMaterial = new THREE.MeshPhongMaterial({ color: 0xf8fafc });
    const diploma = new THREE.Mesh(diplomaGeometry, diplomaMaterial);
    diploma.position.set(-3, -1, -4);
    diploma.rotation.z = Math.PI / 2;
    diploma.castShadow = true;
    scene.add(diploma);
    diplomaRef.current = diploma;

    // Create particle system
    const particleCount = 1000;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 50;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 50;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 50;

      const color = new THREE.Color();
      color.setHSL(Math.random() * 0.2 + 0.5, 0.7, 0.6);
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }

    const particleGeometry = new THREE.BufferGeometry();
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const particleMaterial = new THREE.PointsMaterial({
      size: 0.1,
      vertexColors: true,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending
    });

    const particleSystem = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particleSystem);
    particleSystemRef.current = particleSystem;

    camera.position.z = 8;

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);

      const time = Date.now() * 0.001;

      // Animate graduation cap
      if (graduationCapRef.current) {
        graduationCapRef.current.rotation.y = time * 0.2 + scrollY * 0.01;
        graduationCapRef.current.position.y = 2 + Math.sin(time) * 0.3 + scrollY * 0.005;
      }

      // Animate books
      booksRef.current.forEach((book, i) => {
        book.rotation.x += 0.01;
        book.rotation.y += 0.005;
        book.position.y += Math.sin(time + i) * 0.001;
      });

      // Animate diploma
      if (diplomaRef.current) {
        diplomaRef.current.rotation.y = Math.sin(time * 0.5) * 0.2;
      }

      // Animate particles
      if (particleSystemRef.current) {
        particleSystemRef.current.rotation.y = time * 0.05;
        const positions = particleSystemRef.current.geometry.attributes.position.array;
        for (let i = 0; i < positions.length; i += 3) {
          positions[i + 1] += Math.sin(time + positions[i]) * 0.001;
        }
        particleSystemRef.current.geometry.attributes.position.needsUpdate = true;
      }

      // Camera movement based on mouse
      if (cameraRef.current) {
        cameraRef.current.position.x += (mousePos.x * 2 - cameraRef.current.position.x) * 0.05;
        cameraRef.current.position.y += (-mousePos.y * 2 - cameraRef.current.position.y) * 0.05;
        cameraRef.current.lookAt(0, 0, -5);
      }

      renderer.render(scene, camera);
    };

    animate();

    // Handle resize
    const handleResize = () => {
      if (cameraRef.current && rendererRef.current) {
        cameraRef.current.aspect = window.innerWidth / window.innerHeight;
        cameraRef.current.updateProjectionMatrix();
        rendererRef.current.setSize(window.innerWidth, window.innerHeight);
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (threeRef.current && renderer.domElement) {
        threeRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [mousePos.x, mousePos.y, scrollY]);

  // Mouse and scroll tracking
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setMousePos({
          x: (e.clientX - rect.left - rect.width / 2) / rect.width,
          y: (e.clientY - rect.top - rect.height / 2) / rect.height,
        });
      }
    };

    const handleScroll = () => setScrollY(window.scrollY);

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('scroll', handleScroll);

    setTimeout(() => setIsLoaded(true), 300);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const headlineWords = "Find the Perfect School in Abuja".split(" ");
  const subheadlineWords = "Discover, compare and choose the best educational institutions in the Federal Capital Territory with cutting-edge technology.".split(" ");

  return (
    <div
      ref={containerRef}
      className="relative bg-gradient-to-br from-slate-50 via-white to-blue-50 text-gray-900 overflow-hidden flex items-center justify-center min-h-screen"
    >
      {/* Three.js Canvas */}
      <div
        ref={threeRef}
        className="absolute inset-0 z-0"
        style={{
          opacity: 0.4,
          background: 'radial-gradient(circle at center, rgba(59, 130, 246, 0.1) 0%, transparent 70%)'
        }}
      />

      <div className="absolute inset-0 z-1">
        {/* Glassmorphism elements */}
        <div
          className="absolute w-96 h-96 rounded-full backdrop-blur-3xl bg-gradient-to-r from-blue-200/20 to-yellow-800/20 border border-white/20"
          style={{
            transform: `translate(${mousePos.x * 50}px, ${mousePos.y * 30}px)`,
            animation: 'morphGlass 15s ease-in-out infinite',
            left: '10%',
            top: '20%',
          }}
        />

        <div
          className="absolute w-80 h-80 rounded-full backdrop-blur-2xl bg-gradient-to-r from-indigo-200/15 to-yellow-800/15 border border-white/10"
          style={{
            transform: `translate(${mousePos.x * -30}px, ${mousePos.y * 40}px)`,
            animation: 'morphGlass 20s ease-in-out infinite reverse',
            right: '15%',
            bottom: '25%',
          }}
        />

        {/* Floating geometric shapes */}
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute opacity-20"
            style={{
              left: `${10 + i * 7}%`,
              top: `${15 + (i % 3) * 25}%`,
              transform: `
                rotate(${i * 30}deg) 
                scale(${0.5 + Math.sin(i) * 0.3})
                translate(${mousePos.x * (i + 1) * 5}px, ${mousePos.y * (i + 1) * 3}px)
              `,
              animation: `geometricFloat ${8 + i * 0.5}s ease-in-out infinite`,
              animationDelay: `${i * 0.3}s`,
            }}
          >
            <div
              className={`w-6 h-6 ${i % 3 === 0 ? 'bg-blue-400' : i % 3 === 1 ? 'bg-yellow-600' : 'bg-yellow-900'} ${i % 2 === 0 ? 'rounded-full' : 'rounded-sm rotate-45'}`}
            />
          </div>
        ))}
      </div>

      <div className="container mx-auto px-6 text-center z-10 relative">
        {/* Spectacular Headline with Individual Letter Animations */}
        <div className="relative mb-12">
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black mb-8 leading-tight relative">
            {headlineWords.map((word, wordIndex) => (
              <span
                key={wordIndex}
                className="inline-block mr-4 md:mr-6 relative"
                style={{
                  animation: `${isLoaded ? 'spectacularEntrance' : ''} ${1.2 + wordIndex * 0.15}s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards`,
                  opacity: isLoaded ? 1 : 0,
                  transform: isLoaded ? 'none' : 'translateY(100px) rotateX(90deg)',
                }}
              >
                {word.split('').map((letter, letterIndex) => (
                  <span
                    key={letterIndex}
                    className="inline-block hover:scale-125 transition-all duration-300 cursor-default relative"
                    style={{
                      animation: `letterMagic ${3 + letterIndex * 0.1}s ease-in-out infinite alternate`,
                      animationDelay: `${wordIndex * 0.3 + letterIndex * 0.08}s`,
                      color: wordIndex === 2 || wordIndex === 3 ? '#3b82f6' : '#1e293b',
                      textShadow: `
                        0 4px 8px rgba(0,0,0,0.1),
                        0 0 20px ${wordIndex === 2 || wordIndex === 3 ? 'rgba(59, 130, 246, 0.3)' : 'rgba(30, 41, 59, 0.2)'}
                      `,
                      filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))',
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = 'scale(1.3) translateY(-10px) rotateY(15deg)';
                      e.target.style.textShadow = `
                        0 8px 16px rgba(0,0,0,0.2),
                        0 0 30px rgba(59, 130, 246, 0.6),
                        0 0 50px rgba(168, 85, 247, 0.4)
                      `;
                      e.target.style.color = '#6366f1';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'scale(1) translateY(0) rotateY(0)';
                      e.target.style.textShadow = `
                        0 4px 8px rgba(0,0,0,0.1),
                        0 0 20px ${wordIndex === 2 || wordIndex === 3 ? 'rgba(59, 130, 246, 0.3)' : 'rgba(30, 41, 59, 0.2)'}
                      `;
                      e.target.style.color = wordIndex === 2 || wordIndex === 3 ? '#3b82f6' : '#1e293b';
                    }}
                  >
                    {letter}
                  </span>
                ))}
              </span>
            ))}
          </h1>

          {/* Dynamic multi-colored underline */}
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 h-1 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 via-yellow-500 to-yellow-800 rounded-full"
              style={{
                width: isLoaded ? '70%' : '0%',
                animation: 'rainbowExpand 2s cubic-bezier(0.68, -0.55, 0.265, 1.55) 2s forwards',
              }}
            />
          </div>
        </div>

        {/* Sophisticated Sub-headline with Word-by-Word Animation */}
        <div className="relative mb-16">
          <p className="text-xl md:text-2xl lg:text-3xl max-w-5xl mx-auto text-slate-600 leading-relaxed font-medium">
            {subheadlineWords.map((word, index) => (
              <span
                key={index}
                className="inline-block mr-2 relative"
                style={{
                  animation: `${isLoaded ? 'wordReveal' : ''} ${0.8 + index * 0.04}s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards`,
                  opacity: isLoaded ? 1 : 0,
                  transform: isLoaded ? 'translateY(0)' : 'translateY(30px)',
                  animationDelay: `${3 + index * 0.04}s`,
                }}
              >
                {word}
              </span>
            ))}
          </p>
        </div>

        {/* Next-Level CTA Button */}
        <div className="relative mb-20">
          <button
            className="group relative px-12 py-6 rounded-2xl font-bold text-xl md:text-2xl overflow-hidden transition-all duration-500 transform hover:scale-110 focus:outline-none focus:ring-4 focus:ring-blue-300 focus:ring-offset-4"
            style={{
              background: `
              linear-gradient(135deg, #4b3621 0%, #b88a44 50%, #8c6d3f 100%),
              linear-gradient(135deg, transparent 0%, rgba(255,255,255,0.08) 50%, transparent 100%)
            `,
                          backgroundBlendMode: 'overlay, screen, normal',
              boxShadow: `
                0 20px 40px rgba(59, 130, 246, 0.3),
                0 0 60px rgba(139, 92, 246, 0.2),
                inset 0 2px 0 rgba(255, 255, 255, 0.3),
                inset 0 -2px 0 rgba(0, 0, 0, 0.1)
              `,
              animation: `${isLoaded ? 'epicButtonEntrance' : ''} 1.2s cubic-bezier(0.68, -0.55, 0.265, 1.55) 4s forwards`,
              opacity: isLoaded ? 1 : 0,
              transform: isLoaded ? 'translateY(0) scale(1)' : 'translateY(100px) scale(0.8)',
            }}
            onMouseEnter={(e) => {
              e.target.style.boxShadow = `
                0 30px 60px rgba(59, 130, 246, 0.4),
                0 0 100px rgba(139, 92, 246, 0.3),
                0 0 150px rgba(236, 72, 153, 0.2),
                inset 0 2px 0 rgba(255, 255, 255, 0.4)
              `;
            }}
            onMouseLeave={(e) => {
              e.target.style.boxShadow = `
                0 20px 40px rgba(59, 130, 246, 0.3),
                0 0 60px rgba(139, 92, 246, 0.2),
                inset 0 2px 0 rgba(255, 255, 255, 0.3),
                inset 0 -2px 0 rgba(0, 0, 0, 0.1)
              `;
            }}
          >
            {/* Animated background layers */}
            <div className="absolute inset-0 bg-gradient-to-r from-red-900 via-yellow-600 to-yellow-900 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />

            {/* Particle burst effect */}
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 bg-white rounded-full opacity-0 group-hover:opacity-100"
                style={{
                  left: `${20 + i * 10}%`,
                  top: `${20 + (i % 2) * 60}%`,
                  animation: `particleBurst 1s ease-out infinite`,
                  animationDelay: `${i * 0.1}s`,
                }}
              />
            ))}

            {/* Button content */}
            <div className="relative flex items-center justify-center space-x-4 text-white">
              <Search className="w-7 h-7 group-hover:rotate-12 group-hover:scale-110 transition-all duration-300" />
              <span className="font-black tracking-wide">Explore Schools</span>
            </div>
          </button>
        </div>

        {/* Scroll indicator */}
        <div
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-slate-400"
          style={{
            opacity: Math.max(0, 1 - scrollY / 400),
            animation: `${isLoaded ? 'scrollIndicator' : ''} 1s ease-out 6s forwards`,
          }}
        >
          <ChevronDown
            size={32}
            className="animate-bounce drop-shadow-lg"
          />
        </div>
      </div>

      {/* Master CSS Animations */}
      <style jsx>{`
        @keyframes morphGlass {
          0%, 100% { 
            border-radius: 40% 60% 70% 30% / 40% 40% 60% 50%; 
            transform: rotate(0deg) scale(1);
          }
          25% { 
            border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; 
            transform: rotate(90deg) scale(1.1);
          }
          50% { 
            border-radius: 30% 60% 70% 40% / 50% 60% 30% 60%; 
            transform: rotate(180deg) scale(0.9);
          }
          75% { 
            border-radius: 40% 30% 60% 70% / 40% 70% 60% 30%; 
            transform: rotate(270deg) scale(1.05);
          }
        }

        @keyframes geometricFloat {
          0%, 100% { 
            transform: translateY(0px) rotate(0deg) scale(1); 
            opacity: 0.2; 
          }
          50% { 
            transform: translateY(-30px) rotate(180deg) scale(1.2); 
            opacity: 0.4; 
          }
        }

        @keyframes spectacularEntrance {
          0% {
            opacity: 0;
            transform: translateY(100px) rotateX(90deg) scale(0.5);
          }
          60% {
            opacity: 0.8;
            transform: translateY(-20px) rotateX(-10deg) scale(1.05);
          }
          100% {
            opacity: 1;
            transform: translateY(0) rotateX(0deg) scale(1);
          }
        }

        @keyframes letterMagic {
          0% { 
            transform: translateY(0px) scale(1); 
            text-shadow: 0 4px 8px rgba(0,0,0,0.1);
          }
          100% { 
            transform: translateY(-5px) scale(1.02); 
            text-shadow: 0 8px 16px rgba(0,0,0,0.15), 0 0 30px rgba(59, 130, 246, 0.3);
          }
        }

        @keyframes wordReveal {
          0% {
            opacity: 0;
            transform: translateY(30px) rotateX(45deg);
          }
          100% {
            opacity: 1;
            transform: translateY(0) rotateX(0deg);
          }
        }

        @keyframes epicButtonEntrance {
          0% {
            opacity: 0;
            transform: translateY(100px) scale(0.8) rotateX(45deg);
          }
          70% {
            opacity: 0.9;
            transform: translateY(-10px) scale(1.05) rotateX(-5deg);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1) rotateX(0deg);
          }
        }

        @keyframes particleBurst {
          0% { 
            transform: scale(0) translate(0, 0); 
            opacity: 1; 
          }
          50% { 
            transform: scale(1) translate(20px, -20px); 
            opacity: 0.8; 
          }
          100% { 
            transform: scale(0) translate(40px, -40px); 
            opacity: 0;
          }
        }

        @keyframes rainbowExpand {
          0% { 
            width: 0%; 
            background: linear-gradient(to right, #3b82f6, #3b82f6);
          }
          50% { 
            width: 35%; 
            background: linear-gradient(to right, #3b82f6, #8b5cf6);
          }
          100% { 
            width: 70%; 
            background: linear-gradient(to right, #3b82f6, #8b5cf6, #ec4899);
          }
        }

        @keyframes statsSpectacular {
          0% {
            opacity: 0;
            transform: translateY(80px) rotateY(45deg) scale(0.8);
            filter: blur(10px);
          }
          60% {
            opacity: 0.8;
            transform: translateY(-10px) rotateY(-5deg) scale(1.05);
            filter: blur(2px);
          }
          100% {
            opacity: 1;
            transform: translateY(0) rotateY(0deg) scale(1);
            filter: blur(0px);
          }
        }

        @keyframes scrollIndicator {
          0% {
            opacity: 0;
            transform: translateY(20px) scale(0.8);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        /* Advanced 3D perspective effects */
        .perspective-1000 {
          perspective: 1000px;
        }

        .transform-3d {
          transform-style: preserve-3d;
        }

        /* Glassmorphism utilities */
        .glass-effect {
          backdrop-filter: blur(20px);
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        /* Custom scrollbar for webkit browsers */
        ::-webkit-scrollbar {
          width: 8px;
        }

        ::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
        }

        ::-webkit-scrollbar-thumb {
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          border-radius: 4px;
        }

        /* High-performance animations */
        .gpu-accelerated {
          transform: translateZ(0);
          backface-visibility: hidden;
          perspective: 1000;
        }

        /* Advanced text effects */
        .text-3d {
          text-shadow: 
            0 1px 0 #ccc,
            0 2px 0 #c9c9c9,
            0 3px 0 #bbb,
            0 4px 0 #b9b9b9,
            0 5px 0 #aaa,
            0 6px 1px rgba(0,0,0,.1),
            0 0 5px rgba(0,0,0,.1),
            0 1px 3px rgba(0,0,0,.3),
            0 3px 5px rgba(0,0,0,.2),
            0 5px 10px rgba(0,0,0,.25);
        }

        /* Ultra-smooth transitions */
        .ultra-smooth {
          transition: all 0.6s cubic-bezier(0.25, 0.8, 0.25, 1);
        }

        /* Premium hover effects */
        .premium-hover:hover {
          transform: translateY(-8px) scale(1.02);
          box-shadow: 
            0 25px 50px -12px rgba(0, 0, 0, 0.25),
            0 0 100px rgba(59, 130, 246, 0.3);
        }

        /* Advanced particle system */
        @keyframes advancedParticle {
          0% {
            transform: translate3d(0, 0, 0) rotate(0deg) scale(0);
            opacity: 0;
          }
          10% {
            opacity: 1;
            transform: translate3d(0, 0, 0) rotate(36deg) scale(0.5);
          }
          50% {
            transform: translate3d(100px, -100px, 0) rotate(180deg) scale(1);
            opacity: 0.8;
          }
          100% {
            transform: translate3d(200px, -200px, 0) rotate(360deg) scale(0);
            opacity: 0;
          }
        }

        /* Mesh gradient background */
        .mesh-gradient {
          background: 
            radial-gradient(at 40% 20%, hsla(228,100%,70%,0.1) 0px, transparent 50%),
            radial-gradient(at 80% 0%, hsla(189,100%,56%,0.1) 0px, transparent 50%),
            radial-gradient(at 0% 50%, hsla(355,100%,93%,0.1) 0px, transparent 50%),
            radial-gradient(at 80% 50%, hsla(340,100%,76%,0.1) 0px, transparent 50%),
            radial-gradient(at 0% 100%, hsla(22,100%,77%,0.1) 0px, transparent 50%),
            radial-gradient(at 80% 100%, hsla(242,100%,70%,0.1) 0px, transparent 50%),
            radial-gradient(at 0% 0%, hsla(343,100%,76%,0.1) 0px, transparent 50%);
        }

        /* Modern neumorphism effect */
        .neumorphism {
          background: linear-gradient(145deg, #e6e6e6, #ffffff);
          box-shadow:  
            20px 20px 60px #d9d9d9,
            -20px -20px 60px #ffffff,
            inset 5px 5px 10px rgba(0,0,0,0.1),
            inset -5px -5px 10px rgba(255,255,255,0.8);
        }

        /* Liquid animation */
        @keyframes liquidMorph {
          0%, 100% {
            border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%;
            transform: translate3d(0, 0, 0) scale(1);
          }
          20% {
            border-radius: 30% 60% 70% 40% / 50% 60% 30% 60%;
            transform: translate3d(-10px, -10px, 0) scale(1.02);
          }
          40% {
            border-radius: 40% 30% 60% 70% / 40% 70% 60% 30%;
            transform: translate3d(10px, -5px, 0) scale(0.98);
          }
          60% {
            border-radius: 70% 30% 40% 60% / 30% 40% 70% 60%;
            transform: translate3d(-5px, 10px, 0) scale(1.01);
          }
          80% {
            border-radius: 40% 70% 30% 60% / 70% 50% 30% 40%;
            transform: translate3d(5px, 5px, 0) scale(0.99);
          }
        }

        /* Performance optimizations */
        .will-change-transform {
          will-change: transform;
        }

        .will-change-opacity {
          will-change: opacity;
        }

        .hardware-accelerated {
          transform: translate3d(0, 0, 0);
        }
      `}      </style>
    </div>
  );
};

export default HeroSection;