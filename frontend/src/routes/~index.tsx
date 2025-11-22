import { createFileRoute } from '@tanstack/react-router'
import UploadImage from '@/components/upload-image'
import { useEffect, useState } from 'react'
import LoaderCircleRotate from '@/components/loader-circle-rotate'
import tick from '/icons/tick.svg'
import { BotMessageSquare, Salad } from 'lucide-react'
import imageAnalyze from '@/services/image-analyze.service'
import { useAuthStore } from '@/stores/auth.store'

export const Route = createFileRoute('/')({
  component: Home,
})

type Tip = {
  title: string
  content: string
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
  id: number
  category: string
}

const AnalyzeCategories: AnalyzeCategory[] = [
  { id: 1, category: 'Analyzing image' },
  { id: 2, category: 'Detecting food items' },
  { id: 3, category: 'Calculating nutrients' },
  { id: 4, category: 'Finalizing result' },
]

type NutritionItem = {
  name: keyof Nutrition
  value: number
  unit: string
  primary: boolean
  bg: string
  text: string
}

const nutritionData: NutritionItem[] = [
  {
    name: 'calories',
    value: 542,
    unit: 'kcal',
    primary: true,
    bg: '#FFEDD4',
    text: '#F54A00',
  },
  {
    name: 'protein',
    value: 28,
    unit: 'g',
    primary: true,
    bg: '#FFE2E2',
    text: '#E7000B',
  },
  {
    name: 'carbs',
    value: 45,
    unit: 'g',
    primary: true,
    bg: '#DBEAFE',
    text: '#155DFC',
  },
  {
    name: 'fat',
    value: 18,
    unit: 'g',
    primary: true,
    bg: '#FEF9C2',
    text: '#D08700',
  },
  // {
  //   name: 'Fiber',
  //   value: 6,
  //   unit: 'g',
  //   primary: false,
  //   bg: '#ffffff',
  //   text: '#1F1F1F',
  // },
  // {
  //   name: 'Sugar',
  //   value: 8,
  //   unit: 'g',
  //   primary: false,
  //   bg: '#ffffff',
  //   text: '#1F1F1F',
  // },
]

interface ImageRequest {
  image: File | Blob
}

type Nutrition = {
  calories: number
  protein: number
  carbs: number
  fat: number
}

interface AnalyzeInfo {
  predictions: string[]
  nutritionalInfo: Nutrition
}

function Home() {
  const token = useAuthStore((state) => (state.token))
  const [image, setImage] = useState<ImageRequest | null>(null)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [currentProcessId, setCurrentProcessId] = useState<number | null>(null)
  const [result, setResult] = useState<AnalyzeInfo>()

  useEffect(() => {
    if (!image) {
      setImageUrl(null)
      return
    }

    let analyzeResponse: AnalyzeInfo
    const getAnalyzeResult = async () => {
      analyzeResponse = await imageAnalyze({
        image: image.image,
        token: token,
      })
      if (analyzeResponse) console.log(analyzeResponse)
    }

    getAnalyzeResult()
    setTimeout(() => {
      !result && setResult(analyzeResponse)
    }, 10000)

    const url = URL.createObjectURL(image.image as File)
    setImageUrl(url)
    setCurrentProcessId(0)

    return () => {
      URL.revokeObjectURL(url)
      setCurrentProcessId(null)
    }
  }, [image])

  useEffect(() => {
    function process() {
      setTimeout(() => setCurrentProcessId(1), 2000)
      setTimeout(() => setCurrentProcessId(2), 4000)
      setTimeout(() => setCurrentProcessId(3), 6000)
    }
    if (image && !result) {
      process()
    }
  }, [image, result])

  useEffect(() => {
    if (result) {
      setCurrentProcessId(null)
    }
  }, [result])

  if (!image)
    return (
      <div className="h-full w-full max-w-xl p-6 flex flex-col gap-6 pt-8">
        <div className="flex flex-col gap-1">
          <h1 className="text-charcoal font-bold text-2xl lg:text-3xl">
            Analyze your Meals
          </h1>
          <p className="text-gray-600 font-light text-sm lg:text-base">
            Take a photo your meal and get instant nutrition insights poweed by
            Al
          </p>
        </div>
        <UploadImage onImageSelected={setImage} />
        <div className="w-full flex flex-row gap-4 items-center">
          <div className="h-px bg-gray-600 flex-1" />
          <p className="text-sm lg:text-base text-gray-600 uppercase">
            tips & tricks
          </p>
          <div className="h-px bg-gray-600 flex-1" />
        </div>
        <TipsAndTricks />
        {/* <div className="w-full p-4 lg:p-2 bg-white rounded-lg flex flex-row gap-4 items-center justify-center border border-gray-300">
          <button className="bg-primary p-2 px-6 lg:px-4 rounded-sm text-white font-medium text-sm lg:text-xs">
            Login
          </button>
          <p className="text-charcoal text-sm lg:text-xs">to get premium features</p>
        </div> */}
      </div>
    )

  if (image && !result)
    return (
      <div className="h-full w-full max-w-xl p-6 flex flex-col gap-6">
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
          <div className="mb-4">
            <h2 className="text-charcoal font-semibold text-lg lg:text-xl">
              Analyzing you meal
            </h2>
            <p className="text-gray-600 text-sm lg:text-base">
              Utilizing NutriLens AI to break down your meal's nutrirtions
            </p>
          </div>
          <div className="flex flex-col gap-4">
            {AnalyzeCategories.map((category, id) => (
              <AnalyzeCard
                id={category.id}
                category={category.category}
                isProcessed={currentProcessId != null && id <= currentProcessId}
                isCompleted={currentProcessId != null && id < currentProcessId}
              />
            ))}
          </div>
        </div>
      </div>
    )

  return (
    <div className="h-full w-full max-w-xl p-6 flex flex-col gap-6 lg:gap-8">
      <div className="w-full h-40 p-4 rounded-md border border-gray-300 bg-gray-200">
        {imageUrl && (
          <img
            src={imageUrl}
            alt="Uploaded meal"
            className="w-full h-full object-contain"
          />
        )}
      </div>
      <div>
        <h1 className="text-xl lg:text-2xl font-bold ">Predictions</h1>
        <p className="text-sm lg:text-base font-light text-gray-600">
          {result &&
            result.predictions.map((pred, id) => (
              <span key={id}>{pred}, </span>
            ))}
        </p>
      </div>
      <div>
        <div className="grid grid-cols-2 grid-row-[1fr_1fr_auto] gap-3">
          {nutritionData.map((data, id) => {
            if (data.primary)
              return (
                <div
                  key={id}
                  className="flex flex-col justify-center items-center rounded-md p-4"
                  style={{ background: `${data.bg}` }}
                >
                  <h3 className="text-gray-600 text-sm lg:text-base mb-1">
                    {data.name}
                  </h3>
                  <p
                    className="font-bold text-xl lg:text-2xl"
                    style={{ color: `${data.text}` }}
                  >
                    {result ? result.nutritionalInfo[data.name] : data.value}
                  </p>
                  <p
                    className="font-light text-sm lg:text-base"
                    style={{ color: `${data.text}` }}
                  >
                    {data.unit}
                  </p>
                </div>
              )

            return (
              <div
                key={id}
                className="flex flex-col justify-center rounded-md p-4 border border-gray-200"
                style={{ background: `${data.bg}` }}
              >
                <h3 className="text-gray-600 text-sm lg:text-base">{data.name}</h3>
                <p
                  className="font-bold text-xl"
                  style={{ color: `${data.text}` }}
                >
                  {data.value}
                  {data.unit}
                </p>
              </div>
            )
          })}
        </div>
        <div className="mt-4 flex flex-col gap-2">
          <div className="w-full flex flex-row items-center justify-center gap-4 text-white bg-primary p-2 rounded-md">
            <BotMessageSquare className="size-6" />
            <p className="text-sm lg:text-base font-medium">Ask AI for advices</p>
          </div>
          <div
            className="w-full flex flex-row items-center justify-center gap-4 text-charcoal bg-yellow-green p-2 rounded-md"
            onClick={() => {
              setResult(undefined)
              setImage(null)
            }}
          >
            <Salad className="size-6" />
            <p className="text-sm lg:text-base font-medium">
              Analyze another meal
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function TipsAndTricks() {
  const [idx, setIdx] = useState<number>(0)
  const [title, setTitle] = useState<string>(TipList[idx].title)
  const [content, setContent] = useState<string>(TipList[idx].content)

  useEffect(() => {
    setTitle(TipList[idx].title)
    setContent(TipList[idx].content)
  }, [idx])

  useEffect(() => {
    const timer = setInterval(() => {
      setIdx((prevIdx) => (prevIdx + 1) % TipList.length)
    }, 5000)

    return () => clearInterval(timer)
  }, [])

  return (
    <div className="bg-white p-6 rounded-lg flex flex-col gap-6 justify-center items-center border border-gray-300">
      <div className="flex flex-col gap-1 ">
        <h2 className="text-charcoal text-lg lg:text-xl font-bold">
          {title}
        </h2>
        <p className="text-gray-600 text-sm lg:text-base">{content}</p>
      </div>
      <div className="flex flex-row gap-2">
        {TipList.map((_tip, id) => (
          <div
            className={`h-2  rounded-full ${id === idx ? `w-4 bg-primary` : `w-2  bg-gray-200`} transition-[width] duration-200 ease-in-out`}
            onClick={() => setIdx(id)}
          ></div>
        ))}
      </div>
    </div>
  )
}

interface AnalyzeCardProps {
  isProcessed: boolean
  isCompleted: boolean
  id: number
  category: string
}

function AnalyzeCard({
  isProcessed,
  isCompleted,
  id,
  category,
}: AnalyzeCardProps) {
  return (
    <div
      className={`${isProcessed ? (isCompleted ? `bg-yellow-green` : `bg-yellow-green border border-primary`) : `bg-gray-200`} flex flex-row items-center gap-6 px-4 py-2 text-sm lg:text-sm rounded-md`}
    >
      <div
        className={`flex items-center justify-center size-6 rounded-full  ${isProcessed ? (isCompleted ? `bg-primary` : `bg-yellow-green-dark text-primary`) : `bg-gray-300 text-gray-600`}`}
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
      <div
        className={`text-sm lg:text-base ${isProcessed ? `text-black` : `text-gray-600`}`}
      >
        {category}
      </div>
    </div>
  )
}
