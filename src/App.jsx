import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Land from './Components/Land'
import HeroHighlight from './Components/HeroHighlight'
import './App.css'
import Crossword from './Components/Grade2/Crossword'
import SentenceStrip from './Components/Grade2/SentenceStrip'
import Hopper from './Components/Grade2/Hopper'
import Distance from './Components/Grade2/Distance'
import SentenceBuilder from './Components/Grade3/SentenceBuilder'
import MissingWord from './Components/Grade3/MissingWord'
import AreaBuilder from './Components/Grade3/AreaBuilder'
import GridSplitter from './Components/Grade3/GridSplitter'
import MissingSide from './Components/Grade3/MissingSide'
import PictureMatch from './Components/Grade4/PictureMatch'
import SequencingTiles from './Components/Grade4/SequencingTiles'
import FractionPie from './Components/Grade4/FractionPie'
import FractionCompare from './Components/Grade4/FractionCompare'
import Hero from './Components/Hero'
import Count from './Components/Grade 1/Count'
import Tracing from './Components/Grade 1/Tracing'
import NumberArrange from './Components/Grade4/NumberArrange'
import FormulaBuild from './Components/Chemistry/FormulaBuild'
import PeriodicTable from './Components/Chemistry/PeriodicTable'
import Lab from './Components/Chemistry/Lab/Lab'
import TeacherQuestionBuilder from './Components/Chemistry/Lab/TeacherQuestionBuilder'
import PhysicsLab from './Components/Physics/PhysicsLab'
import FrictionSimulator from './Components/Physics/FrictionSimulator/FrictionSimulator'
import SoundWaveTank from './Components/Physics/SoundWave/SoundWaveTank'
import PhysicsHub from './Components/Physics/PhysicsHub/PhysicsHub'
import BioHub from './Components/Biology/BioHub'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<HeroHighlight />} />

        {/* Grade 1 */}
        <Route path='/grade1/count' element={<Count />} />
        <Route path='/grade1/tracing' element={<Tracing />} />

        {/*Grade 2*/}
        <Route path='/games' element={<Land />} />
        <Route path='/grade2/crossword' element={<Crossword />} />
        <Route path='/grade2/sentence-strip' element={<SentenceStrip />} />
        <Route path='/grade2/hopper' element={<Hopper />} />
        <Route path='/grade2/distance' element={<Distance />} />

        {/*Grade 3*/}
        <Route path='/grade3/sentence-builder' element={<SentenceBuilder />} />
        <Route path='/grade3/missing-word' element={<MissingWord />} />
        <Route path='/grade3/area-builder' element={<AreaBuilder />} />
        <Route path='/grade3/grid-splitter' element={<GridSplitter />} />
        <Route path='/grade3/missing-side' element={<MissingSide />} />

        {/* Grade 4 */}
        <Route path='/grade4/picture-match' element={<PictureMatch />} />
        <Route path='/grade4/sequencing-tiles' element={<SequencingTiles />} />
        <Route path='/grade4/fraction-pie' element={<FractionPie />} />
        <Route path='/grade4/fraction-compare' element={<FractionCompare />} />
        <Route path='/grade4/number-arrange' element={<NumberArrange />} />

        {/* Chemistry */}
        <Route path='/chemistry/periodic-table' element={<PeriodicTable />} />
        <Route path='/chemistry/lab' element={<Lab />} />
        <Route path='/chemistry/lab/teacher' element={<TeacherQuestionBuilder />} />

        {/* Physics */}
        <Route path='/physics/hub'      element={<PhysicsHub />}/>
        <Route path='/physics/lab'      element={<PhysicsLab />}/>
        <Route path='/physics/friction' element={<FrictionSimulator />}/>
        <Route path='/physics/sound'    element={<SoundWaveTank />}/>

        {/* Biology */}
        <Route path='/biology/hub' element={<BioHub />}/>

        {/* Hero */}
        <Route path='/hero' element={<Hero />} />

      </Routes>
    </BrowserRouter>
  )
}

export default App
