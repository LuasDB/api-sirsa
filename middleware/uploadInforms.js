const uploadInform = require('./../functions/multer-config')

const configUploadInforms = (req,res,next)=>{
  const { a } = req.params
  console.log('[AÑO]',a)
  req.uploadInform = uploadInform(`pf/${a}`)
  next()
}

module.exports = {configUploadInforms}
