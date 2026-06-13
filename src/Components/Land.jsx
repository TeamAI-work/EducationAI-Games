import { path } from "framer-motion/client"
import { useNavigate } from "react-router-dom"

export default function Land() {
    const pages = [
        {
            id: 1,
            grade: 2,
            name: 'crossword',
            path: 'crossword'
        },
        {
            id: 2,
            grade: 2,
            name: 'Sentence Strip',
            path: 'sentence-strip'
        },
        {
            id: 3,
            grade: 2,
            name: 'The Hopper',
            path: 'hopper'
        },
        {
            id: 4,
            grade: 2,
            name: 'Distance Finder',
            path: 'distance'
        },
        {
            id: 5,
            grade: 3,
            name: 'Sentence Builder',
            path: 'sentence-builder'
        },
        {
            id: 6,
            grade: 3,
            name: 'Missing Word',
            path: 'missing-word'
        },
        {
            id: 7,
            grade: 3,
            name: 'Area Builder',
            path: 'area-builder'
        },
        {
            id: 8,
            grade: 3,
            name: 'Grid Splitter',
            path: 'grid-splitter'
        },
        {
            id: 9,
            grade: 3,
            name: 'Missing Side',
            path: 'missing-side'
        },
        {
            id: 10,
            grade: 4,
            name: 'Picture Match',
            path: 'picture-match'
        },
        {
            id: 11,
            grade: 4,
            name: 'Sequencing Tiles',
            path: 'sequencing-tiles'
        },
        {
            id: 12,
            grade: 4,
            name: 'Fraction Pie',
            path: 'fraction-pie'
        },
        {
            id: 13,
            grade: 4,
            name: 'Fraction Compare',
            path: 'fraction-compare'
        },

    ]
    const nav = useNavigate()
    return (
        <div className="flex flex-col gap-5 justify-center items-center h-screen w-screen">
            Grade 2
            <div className=" flex justify-center gap-10">

                {
                    pages.map((page) => (
                        page.grade == 2 &&
                        <button
                            key={page.id}
                            className="rounded-xl bg-blue-400 text-black font-bold px-5 py-3 text-2xl"
                            onClick={() => nav(`/grade${page.grade}/${page.path}`)}>
                            {page.name}
                        </button>
                    ))
                }
            </div>
            <div className="flex justify-center w-screen">
                <div className="w-full h-px bg-linear-to-l from-gray-500 to-transparent" />
                <div className="w-full h-px bg-linear-to-r from-gray-500 to-transparent" />
            </div>

            Grade 3
            <div className=" flex justify-center gap-10">
                {
                    pages.map((page) => (
                        page.grade == 3 &&
                        <button
                            key={page.id}
                            className="rounded-xl bg-blue-400 text-black font-bold px-5 py-3 text-2xl"
                            onClick={() => nav(`/grade${page.grade}/${page.path}`)}>
                            {page.name}
                        </button>
                    ))
                }
            </div>
            <div className="flex justify-center w-screen">
                <div className="w-full h-px bg-linear-to-l from-gray-500 to-transparent" />
                <div className="w-full h-px bg-linear-to-r from-gray-500 to-transparent" />
            </div>
            Grade 4
            <div className=" flex justify-center gap-10">
                {
                    pages.map((page) => (
                        page.grade == 4 &&
                        <button
                            key={page.id}
                            className="rounded-xl bg-blue-400 text-black font-bold px-5 py-3 text-2xl"
                            onClick={() => nav(`/grade${page.grade}/${page.path}`)}>
                            {page.name}
                        </button>
                    ))
                }
            </div>
            <div className="flex justify-center w-screen">
                <div className="w-full h-px bg-linear-to-l from-gray-500 to-transparent" />
                <div className="w-full h-px bg-linear-to-r from-gray-500 to-transparent" />
            </div>
        </div>
    )
}