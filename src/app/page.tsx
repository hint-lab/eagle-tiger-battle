'use client';

import { useState } from 'react';
import FileUpload from './components/FileUpload';
import TeamDisplay from './components/TeamDisplay';

interface Student {
  name: string;
  groupNumber: number;
}

interface GroupData {
  groupNumber: number;
  students: Student[];
}

export default function Home() {
  const [groups, setGroups] = useState<GroupData[]>([]);

  const handleDataLoaded = (data: GroupData[]) => {
    setGroups(data);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-start p-8 bg-[var(--background)] text-[var(--foreground)]">
      <div className="z-10 max-w-5xl w-full items-center justify-center">
        <h1 className="text-4xl font-bold text-center mb-8 text-[var(--foreground)] bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent fade-in">学生A/B队分组系统</h1>

        <div className="w-full flex flex-col items-center fade-in">
          <FileUpload onDataLoaded={handleDataLoaded} />

          {groups.length > 0 && (
            <TeamDisplay groups={groups} />
          )}
        </div>
      </div>
    </main>
  );
}
