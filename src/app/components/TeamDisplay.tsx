'use client';

import { useState } from 'react';
import { selectGroupsByMarking, selectRandomGroups, selectStudentsFromGroups, GroupData, Student } from '../lib/excelHandler';
import TeamAvatar, { TeamAvatarsDisplay } from './TeamAvatars';

interface TeamDisplayProps {
    groups: GroupData[];
}

export default function TeamDisplay({ groups }: TeamDisplayProps) {
    const [teamData, setTeamData] = useState<{ teamA: Student[], teamB: Student[] } | null>(null);
    const [studentsPerGroup, setStudentsPerGroup] = useState(3);

    const handleAssignTeams = () => {
        // 先通过标记分组
        const { teamA: markedA, teamB: markedB } = selectGroupsByMarking(groups);

        // 如果有标记的组，使用标记的组；否则随机分配
        let teamAGroups, teamBGroups;

        if (markedA.length > 0 && markedB.length > 0) {
            // 有标记，从标记的组中选择
            teamAGroups = selectRandomGroups(markedA, 4);
            teamBGroups = selectRandomGroups(markedB, 4);
        } else {
            // 没有标记，随机分配
            const shuffled = [...groups].sort(() => 0.5 - Math.random());
            const halfPoint = Math.floor(shuffled.length / 2);

            const allTeamA = shuffled.slice(0, halfPoint);
            const allTeamB = shuffled.slice(halfPoint);

            teamAGroups = selectRandomGroups(allTeamA, 4);
            teamBGroups = selectRandomGroups(allTeamB, 4);
        }

        // 从每组中选择学生
        const teamA = selectStudentsFromGroups(teamAGroups, studentsPerGroup);
        const teamB = selectStudentsFromGroups(teamBGroups, studentsPerGroup);

        setTeamData({ teamA, teamB });
    };

    const handleStudentsPerGroupChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseInt(e.target.value);
        if (!isNaN(value) && value > 0 && value <= 6) {
            setStudentsPerGroup(value);
        }
    };

    if (groups.length === 0) {
        return null;
    }

    return (
        <div className="w-full max-w-4xl p-6 bg-[var(--card-bg)] rounded-lg shadow-xl border border-[var(--card-border)] mt-8 fade-in">
            <h2 className="text-2xl font-bold mb-6 text-center bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">分组结果</h2>

            <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <label htmlFor="studentsPerGroup" className="block text-sm font-medium text-gray-300 mb-1">
                            每组抽取学生数量:
                        </label>
                        <input
                            type="number"
                            id="studentsPerGroup"
                            min="1"
                            max="6"
                            value={studentsPerGroup}
                            onChange={handleStudentsPerGroupChange}
                            className="mt-1 block w-24 px-3 py-2 bg-[#2d2d2d] border border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-[var(--primary)] focus:border-[var(--primary)] text-white"
                        />
                    </div>
                    <button
                        onClick={handleAssignTeams}
                        className="px-4 py-2 bg-[var(--primary)] text-white rounded-md hover:bg-[var(--primary-dark)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-2 focus:ring-offset-[var(--card-bg)] transition-all duration-200 hover:glow-effect"
                    >
                        分配团队
                    </button>
                </div>

                <div className="bg-[#1a1a1a] p-4 rounded-md mb-4 border border-gray-800">
                    <h3 className="font-medium mb-2 text-gray-300">已加载的组:</h3>
                    <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                        {groups.map((group) => (
                            <li key={group.groupName} className="text-sm bg-[#252525] p-2 rounded border border-gray-700 transition-all duration-200 hover:bg-[#303030] hover:border-gray-600">
                                {group.groupName}: <span className="text-[var(--primary)]">{group.students.length}</span> 人
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {teamData && (
                <>
                    <TeamAvatarsDisplay />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 fade-in">
                        <div className="bg-[#2a1c1c] p-4 rounded-lg border border-[#3d2929] transition-all duration-300 hover:shadow-md hover:shadow-red-900/30">
                            <div className="flex items-center mb-3">
                                <TeamAvatar team="A" size={36} className="mr-3" />
                                <h3 className="text-xl font-bold text-[var(--team-a)]">雄鹰队 ({teamData.teamA.length}人)</h3>
                            </div>
                            <div className="overflow-auto max-h-80">
                                <table className="min-w-full divide-y divide-[#3d2929]">
                                    <thead className="bg-[#321e1e]">
                                        <tr>
                                            <th className="px-3 py-2 text-left text-sm font-medium text-[#f87171]">姓名</th>
                                            <th className="px-3 py-2 text-left text-sm font-medium text-[#f87171]">组号</th>
                                            <th className="px-3 py-2 text-left text-sm font-medium text-[#f87171]">学号</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#3d2929]">
                                        {teamData.teamA.map((student, index) => (
                                            <tr key={index} className={index % 2 === 0 ? 'bg-[#2a1c1c]' : 'bg-[#321e1e]'}>
                                                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-300">{student.name}</td>
                                                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-300">{student.groupName}</td>
                                                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-300">{student.studentId}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="bg-[#1a2233] p-4 rounded-lg border border-[#263248] transition-all duration-300 hover:shadow-md hover:shadow-blue-900/30">
                            <div className="flex items-center mb-3">
                                <TeamAvatar team="B" size={36} className="mr-3" />
                                <h3 className="text-xl font-bold text-[var(--team-b)]">猛虎队 ({teamData.teamB.length}人)</h3>
                            </div>
                            <div className="overflow-auto max-h-80">
                                <table className="min-w-full divide-y divide-[#263248]">
                                    <thead className="bg-[#1e2a42]">
                                        <tr>
                                            <th className="px-3 py-2 text-left text-sm font-medium text-[#60a5fa]">姓名</th>
                                            <th className="px-3 py-2 text-left text-sm font-medium text-[#60a5fa]">组号</th>
                                            <th className="px-3 py-2 text-left text-sm font-medium text-[#60a5fa]">学号</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#263248]">
                                        {teamData.teamB.map((student, index) => (
                                            <tr key={index} className={index % 2 === 0 ? 'bg-[#1a2233]' : 'bg-[#1e2a42]'}>
                                                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-300">{student.name}</td>
                                                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-300">{student.groupName}</td>
                                                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-300">{student.studentId}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
} 