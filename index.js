const fs = require('fs')
const sharp = require('sharp')
const path = require('path')

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

const getImageName = (imagePath, width = null) => {
    const fileName = path.basename(imagePath)

    if (width) {
        const extension = path.extname(fileName)
        const nameRoot = path.basename(fileName, extension)
        return `${nameRoot}-${width}w${extension}`
    }

    return fileName
}

const generatePictureElement = (resizedImageName, originalImageName) => {
    const pictureElement = `
        <picture>
        <source media="(max-width: 810px)" srcset="${resizedImageName}">
        <source media="(min-width: 811px)" srcset="${originalImageName}">
        <img src="${originalImageName}">
        </picture>
    `
    return pictureElement
}

const batchProcessImages = async (directoryPath, outputDirectory) => {
    const files = fs.readdirSync(directoryPath)

    if (!fs.existsSync(outputDirectory)) {
        fs.mkdirSync(outputDirectory, { recursive: true })
    }

    const pictureElements = []

    for (const file of files) {
        const imagePath = path.join(directoryPath, file)
        const { resizedImageName, originalImageName } = await resizeImage(imagePath, outputDirectory, 0.9)
        const pictureElement = generatePictureElement(resizedImageName, originalImageName)
        pictureElements.push(pictureElement)

        /** Copy original image to output directory */
        const destinationPath = path.join(outputDirectory, path.basename(originalImageName))
        fs.copyFileSync(imagePath, destinationPath)
    }

    fs.writeFileSync(`${outputDirectory}/output.html`, pictureElements.join('\n'))
}

const directoryPath = '../barbarabeirne.com/v2/appalachian/images'
const outputDirectory = './output/appalachian'

batchProcessImages(directoryPath, outputDirectory)
    .then(() => console.log('done'))
    .catch((error) => console.error('error:', error))
