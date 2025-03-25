import * as XLSX from 'xlsx';

interface Student {
    name: string;  // 姓名
    groupName: string;  // 原始组名，如"第一组"
    studentId: string;  // 学号
    team?: 'A' | 'B';  // 可能的队伍标记
}

export interface GroupData {
    groupName: string;  // 组名
    students: Student[];
}

// 可能未使用的代码，已注释掉
// const GROUP_COLUMN_NAMES = ['组号', '小组', '组', 'group', 'groupnumber', 'group number', '分组', '班组', '队伍'];
// const NAME_COLUMN_NAMES = ['姓名', '名字', '学生', '学生姓名', 'name', 'student', 'student name'];

// 可能未使用的函数，已注释掉
// function findMatchingColumn(headers: string[], possibleNames: string[]): string | null {
//     for (const header of headers) {
//         for (const possibleName of possibleNames) {
//             if (header.toLowerCase() === possibleName.toLowerCase()) {
//                 return header;
//             }
//         }
//     }
//     return null;
// }

// 可能未使用的函数，已注释掉
// function extractGroupNumber(groupName: string): number {
//     const chineseNumbers: Record<string, number> = {
//         '一': 1, '二': 2, '三': 3, '四': 4, '五': 5,
//         '六': 6, '七': 7, '八': 8, '九': 9, '十': 10,
//         '十一': 11, '十二': 12, '十三': 13, '十四': 14, '十五': 15
//     };

//     for (const [chinese, num] of Object.entries(chineseNumbers)) {
//         if (groupName.includes(`第${chinese}组`)) {
//             return num;
//         }
//     }

//     return NaN;
// }

export const readExcelFile = async (file: File): Promise<{ groups: GroupData[], teamsMarked: boolean }> => {
    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonData = XLSX.utils.sheet_to_json(worksheet);

    const groupsMap = new Map<string, Student[]>();
    let teamsMarked = false;

    jsonData.forEach((row) => {
        // 获取组号、姓名、学号和可能的队伍标记
        const groupName = (row as Record<string, unknown>)['组号'] as string || '';
        const name = (row as Record<string, unknown>)['姓名'] as string || '';
        const studentId = ((row as Record<string, unknown>)['学号'] as string | number)?.toString() || '';
        const team = (row as Record<string, unknown>)['组别'] as string; // 可能是A或B

        // 检查是否有A/B标记
        if (team === 'A' || team === 'B') {
            teamsMarked = true;
        }

        if (groupName && name) {
            if (!groupsMap.has(groupName)) {
                groupsMap.set(groupName, []);
            }

            groupsMap.get(groupName)?.push({
                name,
                groupName,
                studentId,
                team: team === 'A' || team === 'B' ? team : undefined
            });
        }
    });

    // 转换为数组格式
    const groups: GroupData[] = [];
    groupsMap.forEach((students, groupName) => {
        groups.push({ groupName, students });
    });

    return { groups, teamsMarked };
};

// 根据已有的A/B标记选择组
export const selectGroupsByMarking = (groups: GroupData[]): { teamA: GroupData[], teamB: GroupData[] } => {
    const teamA: GroupData[] = [];
    const teamB: GroupData[] = [];

    groups.forEach(group => {
        // 检查这个组中是否有被标记为A或B的学生
        const hasTeamA = group.students.some(student => student.team === 'A');
        const hasTeamB = group.students.some(student => student.team === 'B');

        if (hasTeamA) {
            teamA.push(group);
        } else if (hasTeamB) {
            teamB.push(group);
        }
    });

    return { teamA, teamB };
};

// 随机选择组
export const selectRandomGroups = (allGroups: GroupData[], count = 3): GroupData[] => {
    const shuffled = [...allGroups].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, Math.min(count, shuffled.length));
};

// 从每个组中随机选3名学生
export const selectStudentsFromGroups = (groups: GroupData[], studentsPerGroup = 3): Student[] => {
    let allSelectedStudents: Student[] = [];

    groups.forEach(group => {
        const shuffled = [...group.students].sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, Math.min(studentsPerGroup, shuffled.length));
        allSelectedStudents = allSelectedStudents.concat(selected);
    });

    return allSelectedStudents;
}; 