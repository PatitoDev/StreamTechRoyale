import type { ISourceOptions } from "tsparticles-engine";

export const particleOptions: ISourceOptions = {
    fullScreen: {
        enable: true,
        zIndex: -1
    },
    background: {
        color: {
            value: "#D9D9D9",
        },
    },
    fpsLimit: 60,
    particles: {
        collisions: {
            enable: true,
        },
        move: {
            enable: true,
            outModes: {
                default: "bounce",
            },
            random: true,
            speed: 0.2,
            straight: false,
        },
        number: {
            density: {
                enable: true,
                area: 100,
            },
            value: 1,
        },
        shape: {
            type: "image",
            images: [{
                src: '/term.png',
            }]
        },
        size: {
            value: 30,
        },
    },
    detectRetina: true,
};