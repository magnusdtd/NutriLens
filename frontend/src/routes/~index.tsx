import { createFileRoute } from '@tanstack/react-router'
import UploadImage from '@/components/upload-image'
import { useEffect, useState } from 'react'
import LoaderCircleRotate from '@/components/loader-circle-rotate'
import tick from '/icons/tick.svg'
import { BotMessageSquare, Salad } from 'lucide-react'

export const Route = createFileRoute('/')({
  component: Home,
})

type Tip = {
  title: string;
  content: string;
}

const TipList: Tip[] = [
  {
    title: 'Balanced Meals',
    content:
      'Include protein, healthy fats, and complex carbs for sustained energy',
  },
  {
    title: 'Hydration Matters',
    content: 'Drink at least 8 glasses of water daily for optimal health',
  },
  {
    title: 'Portion Control',
    content: 'Use smaller plates and mindful eating to manage portion sizes',
  },
  {
    title: 'Rainbow Diet',
    content:
      'Eat colorful vegetables to get diverse nutrients and antioxidants',
  },
]

type AnalyzeCategory = {
  id: number;
  category: string;
}

const AnalyzeCategories: AnalyzeCategory[] = [
  { id: 1, category: 'Analyzing image' },
  { id: 2, category: 'Detecting food items' },
  { id: 3, category: 'Calculating nutrients' },
  { id: 4, category: 'Finalizing result' },
]

type NutritionItem = {
  name: string
  value: number
  unit: string
  bg: string
  text: string
}


const nutritionData = [
  {
    name: 'Calories',
    value: 542,
    unit: 'kcal',
    bg: '#FFEDD4',
    text: '#F54A00',
  },
  {
    name: 'Protein',
    value: 28,
    unit: 'g',
    bg: '#FFE2E2',
    text: '#E7000B',
  },
  {
    name: 'Carbs',
    value: 45,
    unit: 'g',
    bg: '#DBEAFE',
    text: '#155DFC',
  },
  {
    name: 'Fat',
    value: 18,
    unit: 'g',
    bg: '#FEF9C2',
    text: '#D08700',
  },
  {
    name: 'Fiber',
    value: 6,
    unit: 'g',
    bg: '#E0E7BF',
    text: '#1F1F1F',
  },
  {
    name: 'Sugar',
    value: 8,
    unit: 'g',
    bg: '#E0E7BF',
    text: '#1F1F1F',
  },
]


function TipsAndTricks() {
  const [idx, setIdx] = useState<number>(0);
  const [title, setTitle] = useState<string>(TipList[idx].title)
  const [content, setContent] = useState<string>(TipList[idx].content)

  useEffect(() => {
    setTitle(TipList[idx].title);
    setContent(TipList[idx].content);
  }, [idx])

  useEffect(() => {
    const timer = setInterval(() => {
      setIdx((prevIdx) => (prevIdx + 1) % TipList.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [])

  return (
    <div className="bg-white p-6 rounded-lg flex flex-col gap-6 justify-center items-center border border-gray-300">
      <div className="flex flex-col gap-1 ">
        <h2 className="text-charcoal text-lg font-bold">{title}</h2>
        <p className="text-gray-600 text-sm ">{content}</p>
      </div>
      <div className="flex flex-row gap-2">
        {TipList.map((_tip, id) => (
          <div
            className={`h-2 rounded-full ${id === idx ? 'w-4 bg-primary' : 'w-2 bg-gray-200'} transition-[width] duration-200 ease-in-out`}
            onClick={() => setIdx(id)}
          ></div>
        ))}
      </div>
    </div>
  )
}

interface AnalyzeCardProps {
  isProcessed: boolean;
  isCompleted: boolean;
  id: number;
  category: string;
}

function AnalyzeCard({isProcessed, isCompleted, id, category}: AnalyzeCardProps) {
  return (
    <div
      className={`${isProcessed ? (isCompleted ? 'bg-yellow-green' : 'bg-yellow-green border border-primary') : 'bg-gray-200'} flex flex-row items-center gap-6 px-4 py-2 text-sm rounded-md`}
    >
      <div
        className={`flex items-center justify-center size-6 rounded-full  ${isProcessed ? (isCompleted ? 'bg-primary' : 'bg-yellow-green-dark text-primary') : 'bg-gray-300 text-gray-600'}`}
      >
        {isProcessed ? (
          isCompleted ? (
            <img src={tick} alt="" />
          ) : (
            <LoaderCircleRotate />
          )
        ) : (
          <p>{id}</p>
        )}
      </div>
      <div className={`${isProcessed ? 'text-black' : 'text-gray-600'}`}>
        {category}
      </div>
    </div>
  )
}

function Home() {
  const [image, setImage] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [currentProcessId, setCurrentProcessId] = useState<number | null> (null)
  const [result, setResult] = useState<NutritionItem[]>([])

  useEffect(() => {
    if (!image) {
      setImageUrl(null);
      return;
    }

    setTimeout(() => setResult(nutritionData), 10000)

    const url = URL.createObjectURL(image);
    setImageUrl(url);
    setCurrentProcessId(0);

    return () => {
      URL.revokeObjectURL(url);
      setCurrentProcessId(null);
    };
  }, [image]);

  useEffect(()=> {
    function process() {
      setTimeout(() => setCurrentProcessId(1), 2000)
      setTimeout(() => setCurrentProcessId(2), 4000)
      setTimeout(() => setCurrentProcessId(3), 6000)
    }
    if (image && result.length === 0) {
      process();
    }
  }, [image, result])

  useEffect(()=>{
    if (result) {
      setCurrentProcessId(null)
    }
  }, [result])

  if (!image) return (
    <div className="p-6 flex flex-col gap-6 pt-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-charcoal font-bold text-2xl">Analyze your Meals</h1>
        <p className="text-gray-600 font-light text-sm">
          Take a photo your meal and get instant nutrition insights poweed by Al
        </p>
      </div>
      <UploadImage onImageSelected={setImage} />
      <div className="w-full flex flex-row gap-4 items-center">
        <div className="h-px bg-gray-600 flex-1" />
        <p className="text-sm text-gray-600 uppercase">tips & tricks</p>
        <div className="h-px bg-gray-600 flex-1" />
      </div>
      <TipsAndTricks />
      <div className="w-full p-4 bg-white rounded-lg flex flex-row gap-4 items-center justify-center border border-gray-300">
        <button className="bg-primary p-2 px-6 rounded-sm text-white font-medium text-base">
          Login
        </button>
        <p className="text-charcoal text-sm">to get premium features</p>
      </div>
    </div>
  )

  if (image && result.length === 0) return (
    <div className="p-6 flex flex-col gap-6">
      <div className="w-full h-40 rounded-md border border-gray-300 bg-gray-200">
        {imageUrl && (
          <img
            src={imageUrl}
            alt="Uploaded meal"
            className="w-full h-full object-contain"
          />
        )}
      </div>
      <div>
        <div>
          <h2 className="text-charcoal font-semibold text-lg">
            Analyzing you meal
          </h2>
          <p className="text-gray-600 text-sm">
            Utilizing Naver AI to break down your meal's nutrirtions
          </p>
        </div>
        <div className='flex flex-col gap-4'>
          {AnalyzeCategories.map((category, id) => (
            <AnalyzeCard
              id={category.id}
              category={category.category}
              isProcessed={currentProcessId != null && (id <= currentProcessId)}
              isCompleted={currentProcessId != null && (id < currentProcessId)}
            />
          ))}
        </div>
      </div>
    </div>
  )

  return (
    <div className="p-6 flex flex-col gap-6">
      <div className="w-full h-40 rounded-md border border-gray-300 bg-gray-200">
        {imageUrl && (
          <img
            src={imageUrl}
            alt="Uploaded meal"
            className="w-full h-full object-contain"
          />
        )}
      </div>
      <div>
        <div className="grid grid-cols-2 grid-rows-3 gap-3">
          {nutritionData.map((data, id) => (
            <div
              key={id}
              className="flex flex-col justify-center items-center rounded-md p-4"
              style={{ background: `${data.bg}` }}
            >
              <h3 className="text-gray-600 text-sm mb-2">{data.name}</h3>
              <p
                className="font-bold text-xl"
                style={{ color: `${data.text}` }}
              >
                {data.value}
              </p>
              <p
                className="font-light text-sm"
                style={{ color: `${data.text}` }}
              >
                {data.unit}
              </p>
            </div>
          ))}
        </div>
        <div className="mt-4 flex flex-col gap-2">
          <div className="w-full flex flex-row items-center justify-center gap-4 text-white bg-primary p-2 rounded-md">
            <BotMessageSquare />
            <p className='text-sm font-medium'>Ask AI for advices</p>
          </div>
          <div className="w-full flex flex-row items-center justify-center gap-4 text-charcoal bg-yellow-green p-2 rounded-md" onClick={()=>{setResult([]); setImage(null)}}>
            <Salad />
            <p className='text-sm font-medium'>Analyze another meal</p>
          </div>
        </div>
      </div>
    </div>
  )
}
