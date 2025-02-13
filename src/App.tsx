import { useState } from 'react'
import data from './data.json'

function App() {
  const [tradeTimeline, setTradeTimeline] = useState(data.trade_timeline)
  return (
    <>
      <h1 className="bg-gray-200">Klear</h1>
      <div>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <h2>Trade Timeline</h2>
      <pre>{JSON.stringify(tradeTimeline, null, 2)}</pre>
    </>
  )
}

export default App
