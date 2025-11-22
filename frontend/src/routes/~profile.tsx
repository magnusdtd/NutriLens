import getProfile from '@/services/profile.service'
import { useAuthStore } from '@/stores/auth.store'
import { createFileRoute, redirect } from '@tanstack/react-router'
import { X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { updateProfile as updateProfileService } from '@/services/profile.service'

export const Route = createFileRoute('/profile')({
  beforeLoad: () => {
    const { isAuthenticated } = useAuthStore.getState()
    const token = localStorage.getItem("accessToken")
    if (!isAuthenticated && !token) {
      throw redirect({ to: '/login' })
    }
    return true
  },
  component: RouteComponent,
})

function RouteComponent() {
  // This cause infinite-rerender (?)
  // const { user, token, setUser } = useAuthStore((state) => ({
  //   user: state.user,
  //   token: state.token,
  //   setUser: state.setUser,
  // }))

  // Fix
  const user = useAuthStore((s) => s.user)
  const token = useAuthStore((s) => s.token)
  const setUser = useAuthStore((s) => s.setUser)


  const [editPersonalInfoModal, setEditPersonalInfoModal] = useState<boolean>(false)

  const [username, setUsername] = useState<string>()
  const [gender, setGender] = useState<'Male' | 'Female'>()
  const [age, setAge] = useState<number>()
  const [weight, setWeight] = useState<number>()
  const [height, setHeight] = useState<number>()
  const [cuisine, setCuisine] = useState<string>()
  const [calorieGoal, setCalorieGoal] = useState<number>()
  const [specialDiet, setSpecialDiet] = useState<string>()

  useEffect(() => {
    if (!user) return

    setUsername(user.username)
    setGender(user.gender)
    setAge(user.age)
    setWeight(user.weight)
    setHeight(user.height)
    setCuisine(user.cuisine)
    setCalorieGoal(user.calorieGoal)
    setSpecialDiet(user.specialDiet)
  }, [user])

  async function updateProfile() {
    if (!user) return

    const payload = {
      username: username ?? user.username ?? '',
      age: age ?? user.age ?? 0,
      gender: gender ?? user.gender,
      height: height ?? user.height ?? 0,
      weight: weight ?? user.weight ?? 0,
      cuisine: cuisine ?? user.cuisine ?? '',
      calorieGoal: calorieGoal ?? user.calorieGoal ?? 0,
      specialDiet: specialDiet ?? user.specialDiet ?? '',
    }

    const updatedProfile = await updateProfileService(
      user.id,
      payload,
      token ?? localStorage.getItem('accessToken'),
    )

    if (updatedProfile) {
      setUser(updatedProfile)
      setGender(updatedProfile.gender)
      setAge(updatedProfile.age)
      setWeight(updatedProfile.weight)
      setHeight(updatedProfile.height)
      setCuisine(updatedProfile.cuisine)
      setCalorieGoal(updatedProfile.calorieGoal)
      setSpecialDiet(updatedProfile.specialDiet)
      setEditPersonalInfoModal(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    // Submit on Enter (without Shift)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      e.currentTarget.blur() // force blur → triggers submit
    }
  }

  return (
    <div className="relative h-full w-full max-w-xl p-4 lg:p-6 flex flex-col gap-5">
      {editPersonalInfoModal && (
        <div className="fixed top-0 left-0 w-screen h-full flex flex-col items-center justify-center [@media(max-height:800px)]:justify-start overflow-auto z-10 bg-black/80">
          <div className="z-20 min-w-xs py-6 p-4 bg-white flex flex-col gap-2">
            <div className="flex flex-row items-center justify-between">
              <p className="font-semibold text-xl">Edit Profile</p>
              <X
                className="cursor-pointer"
                onClick={() => setEditPersonalInfoModal(false)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-base" htmlFor="">
                Gender
              </label>
              <div className="min-h-10 w-full bg-yellow-green rounded-md p-4">
                <select
                  className="w-full text-sm"
                  value={gender ?? ''}
                  onChange={(e) =>
                    setGender(e.target.value as 'Male' | 'Female')
                  }
                >
                  <option value="">--Select--</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-base" htmlFor="">
                Age
              </label>
              <div className="flex flex-row gap-2 justify-between items-center min-h-10 w-full bg-yellow-green rounded-md p-2">
                <input
                  className="w-full p-2 text-sm"
                  placeholder="E.g: 20"
                  type="number"
                  value={age ?? ''}
                  onChange={(e) =>
                    setAge(
                      e.target.value === ''
                        ? undefined
                        : Number(e.target.value),
                    )
                  }
                />
                <p className="text-sm text-gray-500">kg</p>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-base" htmlFor="">
                Weight
              </label>
              <div className="flex flex-row gap-2 justify-between items-center min-h-10 w-full bg-yellow-green rounded-md p-2">
                <input
                  className="w-full p-2 text-sm"
                  placeholder="E.g: 75"
                  type="number"
                  value={weight ?? ''}
                  onChange={(e) =>
                    setWeight(
                      e.target.value === ''
                        ? undefined
                        : Number(e.target.value),
                    )
                  }
                />
                <p className="text-sm text-gray-500">kg</p>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-base" htmlFor="">
                Height
              </label>
              <div className="flex flex-row gap-2 justify-between items-center min-h-10 w-full bg-yellow-green rounded-md p-2">
                <input
                  className="w-full p-2 text-sm"
                  placeholder="E.g: 75"
                  type="number"
                  value={height ?? ''}
                  onChange={(e) =>
                    setHeight(
                      e.target.value === ''
                        ? undefined
                        : Number(e.target.value),
                    )
                  }
                />
                <p className="text-sm text-gray-500">cm</p>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-base" htmlFor="">
                Cuisine
              </label>
              <input
                className="min-h-10 w-full bg-yellow-green rounded-md p-4 text-sm"
                placeholder="E.g: Vietnamese"
                type="text"
                value={cuisine ?? ''}
                onChange={(e) => setCuisine(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-base" htmlFor="">
                Calorie Goal
              </label>
              <div className="flex flex-row gap-2 justify-between items-center min-h-10 w-full bg-yellow-green rounded-md p-2">
                <input
                  className="w-full p-2 text-sm"
                  placeholder="E.g: 2000"
                  type="number"
                  value={calorieGoal ?? ''}
                  onChange={(e) =>
                    setCalorieGoal(
                      e.target.value === ''
                        ? undefined
                        : Number(e.target.value),
                    )
                  }
                />
                <p className="text-sm text-gray-500">kcal</p>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-base" htmlFor="">
                Diet requirements
              </label>
              <input
                className="min-h-10 w-full bg-yellow-green rounded-md p-4 text-sm"
                placeholder="E.g: gluton-free"
                type="text"
                value={specialDiet ?? ''}
                onChange={(e) => setSpecialDiet(e.target.value)}
              />
            </div>
            <div className="mt-4 flex flex-row justify-end">
              <button
                onClick={updateProfile}
                className="cursor-pointer bg-yellow-green-dark hover:bg-yellow-green-dark/90 p-2 px-4 rounded-md text-white text-sm"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="bg-white rounded-2xl shadow-sm border border-lime-100">
        <div className="p-5 flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-yellow-green flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                className="w-7 h-7 text-yellow-green-dark"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M12 21s-7-4.35-7-10.2A4.8 4.8 0 0 1 12 8a4.8 4.8 0 0 1 7 2.8C19 16.65 12 21 12 21Z" />
              </svg>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <div
                  contentEditable
                  onInput={(e) => setUsername(e.currentTarget.innerText)}
                  onBlur={updateProfile}
                  onKeyDown={handleKeyDown}
                  className="flex-0 text-lg lg:text-xl font-semibold text-gray-800"
                >{username}</div>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  className="w-4 h-4 text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M12 20h9" />
                  <path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4Z" />
                </svg>
              </div>
              <p className="text-sm text-gray-500">{user && user.email}</p>
            </div>
          </div>
          <div className="border-t border-gray-100 pt-3 flex items-center justify-between text-sm text-gray-600">
            <p className="text-gray-600">Joined</p>
            <p className="font-medium text-gray-700">
              {user && user.createdAt}
            </p>
          </div>
        </div>
      </div>

      {/* <div className="bg-white rounded-2xl shadow-sm border border-lime-100 flex flex-col items-center justify-center px-4 py-2">
        <p className="text-4xl font-bold text-yellow-green-dark">42</p>
        <p className="text-sm text-gray-600">Meals Analyzed</p>
      </div> */}

      <div
        onClick={() => setEditPersonalInfoModal(true)}
        className="w-full flex flex-row justify-end gap-4"
      >
        <p className="text-xs text-yellow-green-dark hover:underline hover:underline-offset-2 cursor-pointer">
          Edit profile
        </p>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          className="w-4 h-4 text-yellow-green-dark"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M12 20h9" />
          <path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4Z" />
        </svg>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-lime-100">
        <div className="p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <p className="text-lg lg:text-xl font-semibold text-gray-800">
              Personal Information
            </p>
          </div>
          <div className="flex flex-col gap-3">
            {[
              {
                label: 'Gender',
                value: gender || 'Male',
              },
              {
                label: 'Age',
                value: age || 20,
              },
              {
                label: 'Weight',
                value: weight || '70',
                metrics: 'kg',
              },
              {
                label: 'Height',
                value: height || '175',
                metrics: 'cm',
              },
              { label: 'Cuisine', value: cuisine || 'Vietnam' },
            ].map((item) => (
              <div
                key={item.label}
                className="bg-lime-50 rounded-xl px-4 py-3 flex items-center justify-between"
              >
                <p className="text-base font-semibold text-gray-800">
                  {item.label}
                </p>
                <p className="text-base font-medium text-gray-500">
                  {item.value} {item.metrics}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-lime-100">
        <div className="p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <p className="text-lg lg:text-xl font-semibold text-gray-800">
              Health Goals
            </p>
            {/* <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              className="w-4 h-4 text-yellow-green-dark"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4Z" />
            </svg> */}
          </div>
          <div className="bg-lime-50 rounded-xl px-4 py-3 flex items-center justify-between">
            <p className="text-base font-semibold text-gray-800">
              Daily Calorie Goal
            </p>
            <p className="text-sm font-semibold text-yellow-green-dark">
              {calorieGoal}
            </p>
          </div>
          <div className="bg-lime-50 rounded-xl px-4 py-3">
            <p className="text-base font-semibold text-gray-800">
              Diet Requirements
            </p>
            <p className="text-sm font-medium text-gray-500">{specialDiet}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
