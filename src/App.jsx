import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Crossword from './Components/Grade1/Crossword'
import SentenceStrip from './Components/Grade1/SentenceStrip'
import Land from './Components/Land'
import './App.css'
import Hopper from './Components/Grade1/Hopper'
import Distance from './Components/Grade1/Distance'
import SentenceBuilder from './Components/Grade2/SentenceBuilder'
import MissingWord from './Components/Grade2/MissingWord'
import AreaBuilder from './Components/Grade2/AreaBuilder'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/*Grade 1*/}
        <Route path='/' element={<Land />} />
        <Route path='/grade1/crossword' element={<Crossword />} />
        <Route path='/grade1/sentence-strip' element={<SentenceStrip />} />
        <Route path='/grade1/hopper' element={<Hopper />} />
        <Route path='/grade1/distance' element={<Distance />} />

        {/*Grade 2*/}
        <Route path='/grade2/sentence-builder' element={<SentenceBuilder />} />
        <Route path='/grade2/missing-word' element={<MissingWord />} />
        <Route path='/grade2/area-builder' element={<AreaBuilder />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
