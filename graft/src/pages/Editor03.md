# src/pages/Editor03.jsx

- loadImageFromFile · function · L18-L32 — function loadImageFromFile(file)
- calcSizeKeepRatio · function · L35-L40 — function calcSizeKeepRatio(w, h, maxEdge)
- resizeAndCompressToBlob · function · L43-L58 — async function resizeAndCompressToBlob(file, { maxEdge, quality })
- blobToFile · function · L61-L63 — function blobToFile(blob, fileName = 'image.jpg')
- twoStepCompress · function · L68-L88 — async function twoStepCompress(file, { preset1 = IMG_COMPRESS_PRESET_1, preset2 = IMG_COMPRESS_PRESET_2 } = {})
- resolveImageUrl · function · L90-L97 — resolveImageUrl = (raw)
- uploadRepresentativeImage · function · L99-L108 — async function uploadRepresentativeImage(file)
- putRepresentativeImages · function · L109-L122 — async function putRepresentativeImages(code, imagesMap = {})
- Editor03 · function · L123-L275 — function Editor03()
- handleImageChange · function · L157-L191 — handleImageChange = ()
