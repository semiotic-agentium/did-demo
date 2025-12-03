import React from 'react'
import StandardLogin from '../components/StandardLogin'
import ZkLogin from '../components/ZkLogin'

const MainPage: React.FC = () => {
  return (
    <div className="main-container">
      <h1>DID Demo</h1>
      <div className="flows-grid">
        <StandardLogin />
        <ZkLogin />
      </div>
    </div>
  )
}

export default MainPage
