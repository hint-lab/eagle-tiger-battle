import * as XLSX from 'xlsx';

export interface Student {
    name: string;  // 姓名
    groupName: string;  // 原始组名，如"第一组"
    studentId: string;  // 学号
    team?: 'A' | 'B';  // 可能的队伍标记
    groupNumber?: number;  // 组号（数字）
}

export interface GroupData {
    groupName: string;  // 组名
    students: Student[];
    groupNumber: number;  // 添加groupNumber属性以匹配page.tsx中的定义
    team?: 'A' | 'B';  // 可能的队伍标记
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

// 提取中文组号中的数字
function extractGroupNumber(groupName: string): number {
    const chineseNumbers: Record<string, number> = {
        '一': 1, '二': 2, '三': 3, '四': 4, '五': 5,
        '六': 6, '七': 7, '八': 8, '九': 9, '十': 10,
        '十一': 11, '十二': 12, '十三': 13, '十四': 14, '十五': 15
    };

    // 尝试从"第X组"格式中提取
    for (const [chinese, num] of Object.entries(chineseNumbers)) {
        if (groupName.includes(`第${chinese}组`)) {
            return num;
        }
    }

    // 尝试直接从字符串中提取数字
    const matches = groupName.match(/\d+/);
    if (matches && matches.length > 0) {
        return parseInt(matches[0], 10);
    }

    // 如果无法提取数字，返回一个默认值或随机数
    return Math.floor(Math.random() * 100) + 1;
}

export const readExcelFile = async (file: File): Promise<{ groups: GroupData[], teamsMarked: boolean }> => {
    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];

    // 获取合并单元格信息
    const merges = worksheet['!merges'] || [];
    console.log('合并单元格信息:', merges);

    // 创建一个映射，用于存储合并单元格的值
    const mergedCellValues = new Map<string, string>();

    // 处理合并单元格
    merges.forEach((merge: { s: { r: number, c: number }, e: { r: number, c: number } }) => {
        const startRow = merge.s.r;
        const endRow = merge.e.r;
        const col = merge.s.c;

        // 获取合并单元格的值（从第一个单元格）
        const cellRef = XLSX.utils.encode_cell({ r: startRow, c: col });
        const cell = worksheet[cellRef];
        const value = cell ? cell.v : undefined;

        if (value !== undefined) {
            // 将值应用到所有合并的单元格
            for (let row = startRow; row <= endRow; row++) {
                const cellKey = `${row},${col}`;
                mergedCellValues.set(cellKey, value.toString());
            }
        }
    });

    const jsonData = XLSX.utils.sheet_to_json(worksheet);

    // 调试：输出读取的数据
    console.log('读取的Excel数据:', jsonData);

    // 检查列名
    if (jsonData.length > 0) {
        const firstRow = jsonData[0] as Record<string, unknown>;
        console.log('Excel列名:', Object.keys(firstRow));
    }

    const groupsMap = new Map<string, Student[]>();
    let teamsMarked = false;

    // 可能的队伍标记列名
    const teamColumnNames = ['队号', '组别', '队伍', 'team', 'teamnumber', 'team number', 'teamname', 'team name'];

    // 找到队号列的索引
    let teamColumnIndex = -1;
    if (jsonData.length > 0) {
        const firstRow = jsonData[0] as Record<string, unknown>;
        const headers = Object.keys(firstRow);
        for (let i = 0; i < headers.length; i++) {
            if (teamColumnNames.includes(headers[i])) {
                teamColumnIndex = i;
                break;
            }
        }
    }

    console.log('队号列索引:', teamColumnIndex);

    jsonData.forEach((row, rowIndex) => {
        // 获取组号、姓名、学号
        const groupName = (row as Record<string, unknown>)['组号'] as string || '';
        const name = (row as Record<string, unknown>)['姓名'] as string || '';
        const studentId = ((row as Record<string, unknown>)['学号'] as string | number)?.toString() || '';

        // 尝试多种可能的列名来获取队伍标记
        let team: string | undefined;

        // 首先检查合并单元格
        if (teamColumnIndex >= 0) {
            const cellKey = `${rowIndex + 1},${teamColumnIndex}`; // +1 是因为jsonData不包含表头
            const mergedValue = mergedCellValues.get(cellKey);
            if (mergedValue === 'A' || mergedValue === 'B') {
                team = mergedValue;
            }
        }

        // 如果没有找到合并单元格的值，则尝试直接从行数据中获取
        if (!team) {
            for (const columnName of teamColumnNames) {
                const value = (row as Record<string, unknown>)[columnName];
                if (value === 'A' || value === 'B') {
                    team = value;
                    break;
                }
            }
        }

        // 调试：输出每行数据
        console.log('行数据:', { groupName, name, studentId, team, rowIndex });

        // 从组名中提取数字
        const groupNumber = extractGroupNumber(groupName);

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
                team: team === 'A' || team === 'B' ? team : undefined,
                groupNumber
            });
        }
    });

    // 转换为数组格式
    const groups: GroupData[] = [];
    groupsMap.forEach((students, groupName) => {
        // 从第一个学生中获取组号
        const groupNumber = students.length > 0 ? students[0].groupNumber || 0 : 0;

        // 检查这个组中是否有被标记为A或B的学生
        const hasTeamA = students.some(student => student.team === 'A');
        const hasTeamB = students.some(student => student.team === 'B');

        // 确定组的队伍
        let team: 'A' | 'B' | undefined;
        if (hasTeamA) {
            team = 'A';
        } else if (hasTeamB) {
            team = 'B';
        }

        groups.push({
            groupName,
            students,
            groupNumber,
            team
        });
    });

    return { groups, teamsMarked };
};

// 根据已有的A/B标记选择组
export const selectGroupsByMarking = (groups: GroupData[]): { teamA: GroupData[], teamB: GroupData[] } => {
    const teamA: GroupData[] = [];
    const teamB: GroupData[] = [];

    groups.forEach(group => {
        // 首先检查组本身是否有team属性
        if (group.team === 'A') {
            teamA.push(group);
        } else if (group.team === 'B') {
            teamB.push(group);
        } else {
            // 如果没有，则检查组内学生是否有标记
            const hasTeamA = group.students.some(student => student.team === 'A');
            const hasTeamB = group.students.some(student => student.team === 'B');

            if (hasTeamA) {
                teamA.push(group);
            } else if (hasTeamB) {
                teamB.push(group);
            }
        }
    });

    return { teamA, teamB };
};

// 随机选择组
export const selectRandomGroups = (allGroups: GroupData[], count: number): GroupData[] => {
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