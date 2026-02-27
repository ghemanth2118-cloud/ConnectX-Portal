import React from 'react'
import { employerFeatures, jobSeekerFeatures } from '../../../Utils/data.js';
import { SectionIcon } from 'lucide-react';
const Feature = () => {
  return (
    <section className="py-24 bg-white relative overflow-hidden">
      <div className="container relative z-10 mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 font-urbanist text-gray-900 leading-tight">
            Everything you need to
            <span className="block bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mt-2 pb-2">
              Succeed
            </span>
          </h2>
          <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed">
            Whether you're looking for your dream job or the perfect candidate, we've got you covered with our comprehensive toolset.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 xl:gap-24 relative">



          {/* Job Seeker Section */}
          <div className="relative group/section">
            <div className="text-center mb-12 relative">

              <h3 className="text-3xl font-extrabold mb-4 font-urbanist text-gray-900 inline-block relative">
                Land Your Dream Job
                <span className="absolute -bottom-2 left-0 w-full h-1.5 bg-linear-to-r from-blue-600 to-purple-600 rounded-full opacity-80"></span>
              </h3>
            </div>

            <div className="space-y-8">
              {jobSeekerFeatures.map((feature, index) => (
                <div key={index} className="group flex items-start space-x-5 p-4 rounded-2xl hover:bg-gray-50 transition-all duration-300">
                  <div className="shrink-0">
                    <div className="p-3 bg-linear-to-br from-blue-500 to-blue-700 rounded-xl shadow-lg shadow-blue-500/20 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                      <feature.icon className="w-6 h-6 text-white" strokeWidth={1.5} />
                    </div>
                  </div>
                  <div>
                    <h4 className='text-lg font-bold text-gray-900 mb-2 font-urbanist group-hover:text-blue-600 transition-colors'>{feature.title}</h4>
                    <p className="text-gray-600 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Employers Section */}
          <div className="relative group/section">
            <div className="text-center mb-12 relative">

              <h3 className="text-3xl font-extrabold mb-4 font-urbanist text-gray-900 inline-block relative">
                Hire Top Talent
                <span className="absolute -bottom-2 left-0 w-full h-1.5 bg-linear-to-r from-purple-600 to-blue-600 rounded-full opacity-80"></span>
              </h3>
            </div>

            <div className="space-y-8">
              {employerFeatures.map((feature, index) => (
                <div key={index} className="group flex items-start space-x-5 p-4 rounded-2xl hover:bg-gray-50 transition-all duration-300">
                  <div className="shrink-0">
                    <div className="p-3 bg-linear-to-br from-purple-500 to-purple-700 rounded-xl shadow-lg shadow-purple-500/20 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                      <feature.icon className="w-6 h-6 text-white" strokeWidth={1.5} />
                    </div>
                  </div>
                  <div>
                    <h4 className='text-lg font-bold text-gray-900 mb-2 font-urbanist group-hover:text-purple-600 transition-colors'>{feature.title}</h4>
                    <p className="text-gray-600 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
export default Feature