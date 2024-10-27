import { EnemyWave } from "../shared/entities/EnemyWave";

export const waves: EnemyWave[] = [
    //WAVE 1 - CIRCLE
    {
        enemyCount: 10,
        path: (t: number) => {
            return {
                x: 320 + 180 * Math.cos(2 * Math.PI * t),
                y: 180 + 180 * Math.sin(2 * Math.PI * t)
            }
        },
        duration: 5000
    },

    //WAVE 2 - TRIANGLE
    {
        enemyCount: 18,
        path: (t: number) => {
            if (t < 0.3)
                return { x: 80 + 800 * t, y: 300 - 800 * t }
            if (t < 0.6)
                return { x: 80 + 800 * t, y: 60 + 800 * (t - 0.3) }
            return { x: 560 - 1200 * (t - 0.6), y: 300 }
        },
        duration: 8000
    },

    //Wave 3 - Figure Eight
    {
        enemyCount: 24,
        path: (t: number) => {
            return { x: 320 + 240 * Math.sin(2 * Math.PI * t), y: 180 + 240 * Math.cos(2 * Math.PI * t) * Math.sin(2 * Math.PI * t) }
        },
        duration: 8000
    }
]