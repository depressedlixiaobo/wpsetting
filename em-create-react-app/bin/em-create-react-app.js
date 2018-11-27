#!/usr/bin/env node 

const fs = require('fs-extra')
const path =require('path')

let appName = process.argv[2]

if(!appName){
    console.log('请输入项目名称')
    return false
}

const appDir = path.resolve(process.cwd(),appName) //app项目路径
const templateDir = path.join(__dirname,'../template') //模板路径


console.log(`appdir:${appDir}`)
console.log(`templateDir:${templateDir}`)

fs.mkdir(appName).then(()=>{
    fs.copy(path.resolve(templateDir,'public'), path.resolve(appDir,'public'))
    .then(()=>{
        //第一个成功
       return fs.copy(path.resolve(templateDir,'src'),path.resolve(appDir,'src'))
    })
    .then(()=>{
          //第二个成功
          let pmArr = [];
          ['.gitignore','.npmrc','package.json'].forEach((item,index)=>{
            pmArr.push( fs.copy(path.resolve(templateDir,item),path.resolve(appDir,item)).then(()=>{
                console.log('完成 '+item)
             })
            )
          })
         return Promise.all(pmArr)
    })
    .then(()=>{
        console.log('文件复制完成')
    })
})


 