const sharp = require('sharp');

// 创建一个 400x400 的白色背景图片
sharp({
  create: {
    width: 400,
    height: 400,
    channels: 4,
    background: { r: 255, g: 255, b: 255, alpha: 1 }
  }
})
.jpeg()
.toFile('test.jpg')
.then(() => {
  console.log('测试图片已创建：test.jpg');
})
.catch(err => {
  console.error('创建测试图片失败：', err);
}); 