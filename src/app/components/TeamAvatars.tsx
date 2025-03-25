'use client';

import React from 'react';

interface TeamAvatarProps {
    team: 'A' | 'B';
    size?: number;
    className?: string;
}

export default function TeamAvatar({ team, size = 60, className = '' }: TeamAvatarProps) {
    // 定义颜色主题
    const colorTheme = team === 'A'
        ? {
            primary: '#b91c1c',
            secondary: '#f87171',
            accent: '#7f1d1d',
            shadow: 'rgba(153, 27, 27, 0.8)',
            glow: '#ef4444'
        }
        : {
            primary: '#1d4ed8',
            secondary: '#60a5fa',
            accent: '#1e3a8a',
            shadow: 'rgba(30, 64, 175, 0.8)',
            glow: '#3b82f6'
        };

    return (
        <div
            className={`relative inline-flex items-center justify-center ${className}`}
            style={{
                width: `${size}px`,
                height: `${size}px`
            }}
        >
            {/* 背景部分 */}
            <div
                className="absolute inset-0 rounded-full animate-pulse"
                style={{
                    background: `radial-gradient(circle, ${colorTheme.accent} 0%, ${colorTheme.primary} 70%)`,
                    boxShadow: `0 0 15px ${colorTheme.shadow}`,
                }}
            ></div>

            {/* 动物图像 */}
            <div
                className="relative z-10"
                style={{
                    width: `${size * 0.85}px`,
                    height: `${size * 0.85}px`,
                }}
            >
                {team === 'A' ? (
                    // 雄鹰图形
                    <svg width="100%" height="100%" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                        {/* 鹰身 */}
                        <path d="M50 30 L65 40 L70 35 L78 38 L75 45 L65 47 L60 55 L50 60 L40 55 L35 47 L25 45 L22 38 L30 35 L35 40 Z"
                            fill="#f8fafc" stroke={colorTheme.secondary} strokeWidth="2" />

                        {/* 鹰嘴 */}
                        <path d="M45 47 L50 57 L55 47"
                            fill={colorTheme.primary} stroke={colorTheme.secondary} strokeWidth="1" />

                        {/* 鹰眼睛 */}
                        <circle cx="42" cy="44" r="3" fill={colorTheme.primary} />
                        <circle cx="58" cy="44" r="3" fill={colorTheme.primary} />

                        {/* 翅膀 */}
                        <path d="M20 50 L5 55 L15 65 L30 55"
                            fill="#f1f5f9" stroke={colorTheme.secondary} strokeWidth="2" />
                        <path d="M80 50 L95 55 L85 65 L70 55"
                            fill="#f1f5f9" stroke={colorTheme.secondary} strokeWidth="2" />
                    </svg>
                ) : (
                    // 老虎图形
                    <svg width="100%" height="100%" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                        {/* 虎头 */}
                        <path d="M50 20 L65 30 L75 45 L70 60 L55 70 L45 70 L30 60 L25 45 L35 30 Z"
                            fill="#fb923c" stroke={colorTheme.secondary} strokeWidth="2" />

                        {/* 虎纹 */}
                        <path d="M40 35 L35 45 M45 30 L40 40 M55 30 L60 40 M60 35 L65 45"
                            stroke="#1e3a8a" strokeWidth="2" strokeLinecap="round" />
                        <path d="M35 55 L45 55 M55 55 L65 55"
                            stroke="#1e3a8a" strokeWidth="2" strokeLinecap="round" />

                        {/* 虎脸 */}
                        <path d="M40 40 L35 38 L32 42 L35 45 L40 42 Z" fill="white" /> {/* 左眼周围 */}
                        <path d="M60 40 L65 38 L68 42 L65 45 L60 42 Z" fill="white" /> {/* 右眼周围 */}
                        <circle cx="38" cy="42" r="3" fill="#1e3a8a" /> {/* 左眼 */}
                        <circle cx="62" cy="42" r="3" fill="#1e3a8a" /> {/* 右眼 */}
                        <path d="M50 48 L45 52 L50 57 L55 52 Z"
                            fill="black" stroke={colorTheme.secondary} strokeWidth="1" /> {/* 鼻子 */}

                        {/* 虎耳 */}
                        <path d="M30 30 L25 20 L35 25 Z" fill="#fb923c" stroke={colorTheme.secondary} strokeWidth="2" />
                        <path d="M70 30 L75 20 L65 25 Z" fill="#fb923c" stroke={colorTheme.secondary} strokeWidth="2" />

                        {/* 胡须 */}
                        <path d="M45 53 L35 50 M45 55 L35 58 M55 53 L65 50 M55 55 L65 58"
                            stroke="white" strokeWidth="1" />
                    </svg>
                )}
            </div>

            {/* 队名标签 */}
            <div
                className="absolute top-0 right-0 bg-white rounded-full flex items-center justify-center border-2 z-20"
                style={{
                    width: `${size * 0.35}px`,
                    height: `${size * 0.35}px`,
                    borderColor: colorTheme.primary,
                    boxShadow: `0 0 5px ${colorTheme.shadow}`,
                }}
            >
                <span
                    style={{
                        fontSize: `${size * 0.2}px`,
                        fontWeight: 'bold',
                        color: colorTheme.primary,
                    }}
                >
                    {team}
                </span>
            </div>

            {/* 光晕效果 */}
            <div
                className="absolute inset-0 rounded-full mix-blend-overlay"
                style={{
                    background: `radial-gradient(circle, ${colorTheme.glow}33 0%, transparent 70%)`,
                }}
            ></div>

            {/* 圆形边框 */}
            <svg className="absolute" width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="50" cy="50" r="48" stroke={colorTheme.secondary} strokeWidth="2" strokeDasharray="5 5" />
            </svg>
        </div>
    );
}

// 同时显示A和B两个队伍头像的组件
export function TeamAvatarsDisplay() {
    return (
        <div className="flex items-center justify-center gap-8 my-6">
            <div className="text-center">
                <TeamAvatar team="A" size={100} className="mb-3" />
                <h3 className="text-[var(--team-a)] font-bold text-xl">雄鹰队</h3>
            </div>

            <div className="text-center relative">
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-3xl font-bold text-[var(--primary)] animate-pulse">
                    VS
                </div>
            </div>

            <div className="text-center">
                <TeamAvatar team="B" size={100} className="mb-3" />
                <h3 className="text-[var(--team-b)] font-bold text-xl">猛虎队</h3>
            </div>
        </div>
    );
} 