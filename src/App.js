// import React ,{Component}from 'react';
// import './App.css';
// import ipfsAPI from 'ipfs-api';

// var ipfs = ipfsAPI('localhost', '5001', {protocol: 'http'})

// saveTextBlobOnIpfs = (blob) => {
//   return new Promise(function(resolve,reject){
//     const descBuffer=Buffer.from(blob,'utf-8');
//     ipfs.add(descBuffer).then((response)=>{
//       console.log(response);
//       resolve(response[0].hash);
//     }).catch((err)=>{
//       console.error(err);
//       reject(err);
//     })
//   })
// }

// function App() {
//   return (
//     <div className="App">
//       <input style={{width:200,height:50}} id="ipfs_input"></input>
//       <button style={{width:200,height:50}}
//       onClick={()=>{
//         var value1=document.getElementById("ipfs_input");
//         var content=value1.value;
//         console.log(content);

//       }}
//       >测试IPFS</button>
//     </div>
//   );
// }
import React, { Component } from 'react'

import './App.css'
import ipfsAPI from 'ipfs-api' //这是ES6的写法，导入包

// const ipfsAPI = require('ipfs-api') //这是ES5的写法

const ipfs = ipfsAPI({ host: 'localhost', port: '5001', protocol: 'http' })

function Utf8ArrayToStr(array) {
  //传过来一个数组，先计算字符长度。
  //将utf8数据转换成字符串。
  var out, i, len, c

  var char2, char3

  out = ''

  len = array.length //字符串长度

  i = 0
  while (i < len) {
    c = array[i++]
    switch (c >> 4) {
      case 0:
      case 1:
      case 2:
      case 3:
      case 4:
      case 5:
      case 6:
      case 7: // 0xxxxxxx
        out += String.fromCharCode(c)
        break
      case 12:
      case 13: // 110x xxxx   10xx xxxx
        char2 = array[i++]

        out += String.fromCharCode(((c & 0x1f) << 6) | (char2 & 0x3f))
        break
      case 14: // 1110 xxxx  10xx xxxx  10xx xxxx
        char2 = array[i++]

        char3 = array[i++]

        out += String.fromCharCode(
          ((c & 0x0f) << 12) | ((char2 & 0x3f) << 6) | ((char3 & 0x3f) << 0)
        )
        break
      default:
        break
    }
  }
  return out
}

class App extends Component {
  //构造函数
  constructor(props) {
    super(props)
    this.state = { strHash: null, strContent: null } //strhash获得哈希值，strcontent将哈希值转换成实际内容
  }

  //上传大文本字符串到ipfs的Promise函数
  saveTextBlobOnIpfs = blob => {
    return new Promise(function(resolve, reject) {
      const descBuffer = Buffer.from(blob, 'utf-8')
      ipfs
        .add(descBuffer)
        .then(response => {
          console.log(response)
          resolve(response[0].hash)
        })
        .catch(err => {
          console.error(err)
          reject(err)
        })
    })
  }
  saveImgOnIPFS = reader => {
    return new Promise(function(resolve, reject) {
      const buffer = Buffer.from(reader.result)
      ipfs
        .add(buffer)
        .then(response => {
          console.log(response)
          resolve(response[0].hash)
        })
        .catch(err => {
          console.error(err)
          reject(err)
        })
    })
  }

  render() {
    return (
      <div className="App">
        <input
          id="ipfsContent"
          style={{ width: 200, height: 40, borderWidth: 2 }}
        />

        <button
          onClick={() => {
            let value1 = document.getElementById('ipfsContent')
            let value_content = value1.value
            // let ipfsContent = this.refs.ipfsContent.value
            console.log(value_content)
            this.saveTextBlobOnIpfs(value_content).then(hash => {
              console.log(hash)
              this.setState({ strHash: hash })
            })
          }}
        >
          提交到IPFS
        </button>

        <p>{this.state.strHash}</p>

        <button
          onClick={() => {
            //在这里读取数据
            console.log('从ipfs读取数据。')
            //cat 显示ipfs上的数据
            ipfs.cat(this.state.strHash).then(stream => {
              console.log(stream)
              let strContent = Utf8ArrayToStr(stream)
              console.log(strContent)
              this.setState({ strContent: strContent })
            })
          }}
        >
          读取数据
        </button>

        <h1>{this.state.strContent}</h1>
        <h2>ipfs将图片上传</h2>
        <biv>
          <label id="file">选择文件上传</label>
          <input
            type="file"
            ref="file"
            id="file"
            name="file"
            multiple="multiple"
          ></input>
        </biv>
        <div>
          <button
            onClick={() => {
              var file = this.refs.file.files[0]
              var reader = new FileReader()
              //上传的是图片的链接
              // reader.readAsDataURL(file);
              //上传的是图片文件
              reader.readAsArrayBuffer(file)
              //回调函数，当图片上传成功，会在回调函数中做一些处理
              reader.onloadend = e => {
                //上传图片到IPFS
                console.log(reader)
                this.saveImgOnIPFS(reader).then(hash => {
                  console.log(hash)
                  this.setState({ imgHash: hash })
                })
              }
            }}
          >
            提交
          </button>
        </div>
        {/* 如果存在内容的话，就将哈希值输出，否则输出错误 */}
        {this.state.imgHash ? (
          <h1>{this.state.imgHash}</h1>
        ) : (
          <h1> {'什么都没有哦！'}</h1>
        )}
      </div>
    )
  }
}
export default App
