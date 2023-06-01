const fs = require('fs')
const sharp = require('sharp')

const resizeImage = async (imagePath, outputDirectory, percentage) => {
    const image = sharp(imagePath)
    const metadata = await image.metadata()
    const width = Math.floor(metadata.width * percentage)
    const height = Math.floor(metadata.height * percentage)
    const resizedImageName = getImageName(imagePath, width)

    await image.resize(width, height).toFile(`${outputDirectory}/${resizedImageName}`)

    return {
        resizedImageName,
        originalImageName: getImageName(imagePath)
    }
}

const getImageName = (imagePath, width = null) {
    const pathTokens = imagePath.split('/')
    const fileName = pathTokens[pathTokens.length - 1]

    if (width) {
        const extensionIndex = fileName.lastIndexOf('.')
        const nameRoot = fileName.substring(0, extensionIndex)
        const fileExtension = fileName.substring(extensionIndex)
        return `${nameRoot}-${width}w${fileExtension}`
    }

    return fileName
}

const generatePictureElement = (resizedImageName, originalImageName) => {
    const pictureElement = `
        <picture>
        <source media="(max-width: 810px)" srcset="${resizedImageName}">
        <source media="(min-width: 811px)" srcset="${originalImageName}">
        <img src="${originalImageName}>
        </picture>
    `
    return pictureElement
}

const batchProcessImages = (directoryPath, outputDirectory) => {
    const files = fs.readdirSync(directoryPath)

    if(!fs.existsSync(outputDirectory)) {
        fs.mkdirSync(outputDirectory, {recursive: true})
    }

    const pictureElements = []

    for (const file of files) {
        const imagePath = `${directoryPath/$file}`
        const {resizedImageName, originalImageName } = await resizeImage(imagePath, outputDirectory, 0.33)
        const pictureElement = generatePictureElement(resizedImageName, originalImageName)
        pictureElements.push(pictureElement)
    }

    fs.writeFileSync(`${outputDirectory}/output.html`, pictureElements.join('\n'))
}