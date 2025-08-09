import { useState } from 'react'
import { createBaby } from '../services/local'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '../store/useAppStore'

export function Onboarding() {
  const [name, setName] = useState('')
  const [dob, setDob] = useState('')
  const [gender, setGender] = useState('')
  const [units, setUnits] = useState<'metric'|'imperial'>('metric')
  const navigate = useNavigate()
  const setBabyId = useAppStore(s=>s.setBabyId)
  const setUnitsPref = useAppStore(s=>s.setUnits)

  async function onSubmit(e: React.FormEvent){
    e.preventDefault()
    const id = await createBaby({ name, dob, gender, units })
    setBabyId(id)
    setUnitsPref(units)
    navigate('/')
  }

  return (
    <form className="stack gap" onSubmit={onSubmit}>
      <h2>Baby Profile</h2>
      <label>
        Name
        <input value={name} onChange={e=>setName(e.target.value)} required />
      </label>
      <label>
        Date of Birth
        <input type="date" value={dob} onChange={e=>setDob(e.target.value)} required />
      </label>
      <label>
        Gender
        <select value={gender} onChange={e=>setGender(e.target.value)}>
          <option value="">Select</option>
          <option>Girl</option>
          <option>Boy</option>
          <option>Other</option>
        </select>
      </label>
      <label>
        Units
        <select value={units} onChange={e=>setUnits(e.target.value as any)}>
          <option value="metric">Metric</option>
          <option value="imperial">Imperial</option>
        </select>
      </label>
      <button className="btn" type="submit">Save</button>
    </form>
  )
}
