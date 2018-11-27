import React, { Component } from 'react'
import img from './img/a.png'
import './a.scss'
import './b.scss'
class App extends Component {
  constructor() {
    super()
    let a = 132 / 0
    debugger
    alert('1')
    console.log(a)
    this.isShow = {
      img:'sdfds',
       
    }
  }
  handleClick = () => {
    alert('a')
  }
  render() {
    return (
      <div className="App" >
        <img src={img } />
        <input type='file' /> 
        <input value='点击' type='button' onClick={this.handleClick} />
      </div>
    );
  }
}

export default App;