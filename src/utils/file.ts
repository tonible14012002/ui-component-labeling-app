export const formatReadableFileSize = (size: number): string => {
    if (size < 1024) return `${size} B`;
    const units = ["KB", "MB", "GB", "TB"];
    let index = -1;
    do {
        size /= 1024;
        index++;
    } while (size >= 1024 && index < units.length - 1);
    return `${size.toFixed(2)} ${units[index]}`;
}

type FileType = "application/json" | "text/plain";

export const stringToDownloadFile = (data: string, fileName: string, type: FileType = "text/plain") => {
    const blob = new Blob([data], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);

} 