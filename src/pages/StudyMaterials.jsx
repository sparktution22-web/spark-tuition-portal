import { useEffect, useState } from 'react'
import { FiFileText, FiDownload, FiBook } from 'react-icons/fi'
import { useStudentContext } from '../contexts/StudentContext.jsx'
import { getStudyMaterialsForClass } from '../services/api/sheetsApi.js'
import { loadCached, saveCache } from '../utils/pageCache.js'
import StudentSwitcher from '../components/StudentSwitcher.jsx'
import { SkeletonTable } from '../components/Skeleton.jsx'
import EmptyState from '../components/EmptyState.jsx'

export default function StudyMaterials() {
  const { selectedStudent } = useStudentContext()
  const [materials, setMaterials] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!selectedStudent?.class) return
    const cacheKey = 'spark_cache_study_materials_' + selectedStudent.class
    const cached = loadCached(cacheKey)
    if (cached) {
      setMaterials(cached)
      setLoading(false)
    } else {
      setLoading(true)
    }
    getStudyMaterialsForClass(selectedStudent.class).then((data) => {
      setMaterials(data)
      setLoading(false)
      saveCache(cacheKey, data)
    })
  }, [selectedStudent?.class])

  if (loading) return <SkeletonTable rows={4} />

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="font-display font-bold text-xl text-spark-ink dark:text-white flex items-center gap-2">
          <FiBook className="text-spark-orange" /> Study Materials
        </h2>
        <StudentSwitcher />
      </div>

      {materials.length === 0 ? (
        <EmptyState message="No study materials shared yet for your class." />
      ) : (
        <div className="bg-white dark:bg-white/5 rounded-xl2 shadow-card border border-spark-ink/5 dark:border-white/10 overflow-hidden">
          <div className="divide-y divide-spark-ink/5 dark:divide-white/5">
            {materials.map((m) => (
              <div key={m.materialId} className="flex items-center justify-between px-6 py-4 gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-spark-surface dark:bg-white/5 flex items-center justify-center shrink-0">
                    <FiFileText className="text-spark-orange" size={18} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-spark-ink dark:text-white truncate">{m.title}</p>
                    <p className="text-xs text-spark-ink/40 dark:text-white/40">{m.subject}</p>
                  </div>
                </div>
                <a
                  href={`https://drive.google.com/file/d/${m.fileId}/view`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-spark-gradient text-white text-xs font-bold shadow-soft hover:shadow-card-hover transition-all shrink-0"
                >
                  <FiDownload size={13} /> View
                </a>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
