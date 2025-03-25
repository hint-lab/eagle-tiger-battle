'use client';

import { useState } from 'react';
import { readExcelFile } from '../lib/excelHandler';
import * as XLSX from 'xlsx';

interface FileUploadProps {
    onDataLoaded: (data: any) => void;
}

export default function FileUpload({ onDataLoaded }: FileUploadProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [fileName, setFileName] = useState<string | null>(null);

    // 创建并下载示例Excel模板
    const downloadTemplate = () => {
        // 创建工作簿和工作表
        const wb = XLSX.utils.book_new();

        // 创建表头和示例数据
        const sampleData = [
            { '组号': '第一组', '姓名': '张三', '学号': '1234567890', '队号': 'A' },
            { '组号': '第一组', '姓名': '李四', '学号': '1234567890', '队号': 'A' },
            { '组号': '第一组', '姓名': '王五', '学号': '1234567890', '队号': 'A' },
            { '组号': '第一组', '姓名': '赵六', '学号': '1234567890', '队号': 'A' },
            { '组号': '第二组', '姓名': '钱七', '学号': '1234567890', '队号': 'B' },
            { '组号': '第二组', '姓名': '孙八', '学号': '1234567890', '队号': 'B' },
            { '组号': '第二组', '姓名': '周九', '学号': '1234567890', '队号': 'B' },
            { '组号': '第二组', '姓名': '吴十', '学号': '1234567890', '队号': 'B' },
        ];

        // 转换为工作表
        const ws = XLSX.utils.json_to_sheet(sampleData);

        // 添加合并单元格
        // 合并A队的队号单元格（第1-4行的第4列）
        // 合并B队的队号单元格（第5-8行的第4列）
        ws['!merges'] = [
            { s: { r: 1, c: 3 }, e: { r: 4, c: 3 } }, // A队（从索引1到4）
            { s: { r: 5, c: 3 }, e: { r: 8, c: 3 } }  // B队（从索引5到8）
        ];

        // 添加工作表到工作簿
        XLSX.utils.book_append_sheet(wb, ws, "学生分组");

        // 导出Excel文件
        XLSX.writeFile(wb, "学生分组模板.xlsx");
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setFileName(file.name);
        setSuccess(null);

        // 检查文件类型
        if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
            setError('请上传Excel文件 (.xlsx 或 .xls)');
            return;
        }

        try {
            setLoading(true);
            setError(null);
            console.log(`开始处理文件: ${file.name}`);

            const data = await readExcelFile(file);
            console.log('Excel解析完成，获取到数据:', data);

            if (!data || data.groups.length === 0) {
                setError('Excel文件中没有找到有效的学生数据，请检查文件格式。文件应包含"组号"和"姓名"列。');
                return;
            }

            setSuccess(`成功读取 ${data.groups.length} 个组的学生数据`);
            onDataLoaded(data.groups);
        } catch (err) {
            console.error('读取文件失败', err);
            setError('无法读取Excel文件，请确保格式正确。文件应包含"组号"和"姓名"列。');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-md p-6 bg-[var(--card-bg)] rounded-lg shadow-xl border border-[var(--card-border)] transition-all duration-300 hover:shadow-[var(--accent)]/20 hover:shadow-lg">
            <h2 className="text-xl font-bold mb-4 text-[var(--foreground)] bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">上传学生分组数据</h2>
            <p className="mb-4 text-gray-400">上传包含学生信息的Excel文件，A/B两队每队抽取3组同学</p>

            <div className="flex items-center justify-center w-full">
                <label
                    htmlFor="file-upload"
                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-[#1a1a1a] hover:bg-[#252525] border-gray-600 hover:border-[var(--primary)] transition-all duration-200"
                >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <svg className="w-8 h-8 mb-4 text-[var(--primary)] pulse-effect" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2" />
                        </svg>
                        <p className="mb-2 text-sm text-gray-400">
                            <span className="font-semibold text-[var(--primary)]">点击上传</span> 或拖放文件
                        </p>
                        <p className="text-xs text-gray-500">Excel文件 (XLSX, XLS)</p>
                        {fileName && <p className="text-xs text-[var(--primary)] mt-1">已选择: {fileName}</p>}
                    </div>
                    <input
                        id="file-upload"
                        type="file"
                        className="hidden"
                        accept=".xlsx,.xls"
                        onChange={handleFileChange}
                        disabled={loading}
                    />
                </label>
            </div>

            {loading && (
                <div className="mt-4 text-center">
                    <svg className="inline w-6 h-6 text-[var(--primary)] animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="ml-2 text-gray-300">正在处理文件...</span>
                </div>
            )}

            {success && (
                <div className="mt-4 text-[var(--success)] text-center fade-in">
                    <svg className="inline w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                    </svg>
                    {success}
                </div>
            )}

            {error && (
                <div className="mt-4 text-[var(--danger)] text-center fade-in">
                    <svg className="inline w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path>
                    </svg>
                    {error}
                </div>
            )}

            <div className="mt-4 p-3 bg-[#252525] rounded-md border border-gray-700">
                <h3 className="text-sm font-medium text-gray-300 mb-2">Excel文件格式说明:</h3>
                <ul className="text-xs text-gray-400 list-disc pl-5 space-y-1 mb-3">
                    <li>文件必须包含"组号"和"姓名"列</li>
                    <li>组号必须是数字，用于区分不同组的学生</li>
                    <li>每行一条学生记录</li>
                    <li>支持Excel 2007+格式(.xlsx)和旧版Excel格式(.xls)</li>
                </ul>
                <button
                    onClick={downloadTemplate}
                    className="w-full py-1.5 px-3 bg-[var(--primary)] text-white text-xs rounded hover:bg-[var(--primary-dark)] transition-all duration-200"
                >
                    下载Excel模板示例
                </button>
            </div>
        </div>
    );
} 