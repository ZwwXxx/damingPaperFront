export function formatSeconds(remainTime) {
    // 传入毫秒级别，乘1000
    const hours = Math.floor(remainTime / 3600);
    const minutes = Math.floor((remainTime % 3600) / 60);
    const seconds = remainTime % 60
    return hours + ' 时 ' + minutes + ' 分 ' + seconds + ' 秒 '
}
