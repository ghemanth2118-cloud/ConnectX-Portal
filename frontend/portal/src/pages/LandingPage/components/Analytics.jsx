import React from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, Users, Briefcase, Target } from 'lucide-react'

const Analytics = () => {
  const stats = [
    {
      icon: TrendingUp,
      title: "Trending Jobs",
      value: "2.4m",
      growth: "+15%",
      color: "blue",
      gradient: "from-blue-500 to-blue-700",
      shadow: "shadow-blue-500/20",
      hover: "hover:text-blue-600"
    },
    {
      icon: Users,
      title: "Connect with Experts",
      value: "1.2m",
      growth: "+12%",
      color: "purple",
      gradient: "from-purple-500 to-purple-700",
      shadow: "shadow-purple-500/20",
      hover: "hover:text-purple-600"
    },
    {
      icon: Briefcase,
      title: "Verified Opportunities",
      value: "850k",
      growth: "+25%",
      color: "green",
      gradient: "from-green-500 to-green-700",
      shadow: "shadow-green-500/20",
      hover: "hover:text-green-600"
    },
    {
      icon: Target,
      title: "Personalized Recommendations",
      value: "780k",
      growth: "+30%",
      color: "orange",
      gradient: "from-orange-500 to-orange-700",
      shadow: "shadow-orange-500/20",
      hover: "hover:text-orange-600"
    }
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  }

  return (
    <section className="py-24 bg-gray-50 relative overflow-hidden">
      <div className="container relative z-10 mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6 font-urbanist text-gray-900 leading-tight">
            Unlock Your Full
            <span className="block bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mt-2 pb-2">
              Potential
            </span>
          </h2>
          <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed">
            Leverage our advanced analytics and networking tools to make data-driven career decisions.
          </p>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{ y: -10 }}
              className="bg-white rounded-3xl p-8 shadow-xl shadow-gray-200/50 hover:shadow-2xl transition-all duration-300 border border-gray-100"
            >
              <div className={`w-14 h-14 rounded-2xl bg-linear-to-br ${stat.gradient} flex items-center justify-center mb-6 shadow-lg ${stat.shadow}`}>
                <stat.icon className="w-7 h-7 text-white" strokeWidth={1.5} />
              </div>

              <h3 className={`text-xl font-bold text-gray-600 mb-2 font-urbanist ${stat.hover} transition-colors`}>
                {stat.title}
              </h3>

              <div className="flex items-baseline space-x-3">
                <span className={`text-4xl font-extrabold text-gray-900 tracking-tight`}>
                  {stat.value}
                </span>
                <span className={`text-sm font-bold px-2 py-1 rounded-full bg-${stat.color}-50 text-${stat.color}-600`}>
                  {stat.growth}
                </span>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

export default Analytics