import React from 'react'
import { motion } from 'framer-motion'
import { Briefcase, Github, Twitter, Linkedin, Facebook, Instagram, Mail } from 'lucide-react';

const Footer = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  }

  const socialLinks = [
    { icon: Github, href: "#", color: "hover:text-gray-100" },
    { icon: Twitter, href: "#", color: "hover:text-blue-400" },
    { icon: Linkedin, href: "#", color: "hover:text-blue-600" },
    { icon: Instagram, href: "#", color: "hover:text-pink-500" },
  ]

  const footerLinks = [
    {
      title: "Product",
      links: ["Features", "Analytics", "Pricing", "Enterprise"]
    },
    {
      title: "Resources",
      links: ["Documentation", "Guides", "Support", "API Status"]
    },
    {
      title: "Contact Us",
      links: ["Email: ghemath2118@gmail.com", "Careers", "About"]
    }
  ]

  return (
    <footer className="bg-gray-900 text-white relative overflow-hidden font-urbanist">
      {/* Decorative blurry blobs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-20">
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-600 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-purple-600 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 container mx-auto px-6 py-20">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8 mb-16"
        >
          {/* Brand Column */}
          <motion.div variants={itemVariants} className="lg:col-span-4 space-y-6">
            <div className="flex items-center space-x-3">
              <img src="/logo.svg" alt="Nexus Logo" className="w-10 h-10 object-contain" />
              <span className="text-3xl font-black tracking-tighter bg-linear-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">Nexus</span>
            </div>
            <p className="text-gray-400 leading-relaxed max-w-sm">
              Empowering careers and businesses with advanced AI-driven connections.
              Find your path or your next star employee today.
            </p>
            <div className="flex space-x-4 pt-2">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  className={`p-2 bg-gray-800 rounded-full transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-blue-500/20 ${social.color}`}
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </motion.div>

          {/* Links Columns */}
          {footerLinks.map((column, index) => (
            <motion.div key={index} variants={itemVariants} className="lg:col-span-2 space-y-6">
              <h4 className="text-lg font-bold">{column.title}</h4>
              <ul className="space-y-4">
                {column.links.map((link, idx) => (
                  <li key={idx}>
                    <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors duration-200 text-sm font-medium block hover:translate-x-1 transform">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}

          {/* Newsletter Column */}
          <motion.div variants={itemVariants} className="lg:col-span-2 space-y-6">
            <h4 className="text-lg font-bold">Stay Updated</h4>
            <p className="text-gray-400 text-sm">
              Subscribe to our newsletter for the latest job market insights.
            </p>
            <form className="space-y-3" onSubmit={(e) => e.preventDefault()}>
              <div className="relative">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full pl-4 pr-12 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm placeholder-gray-500 transition-all"
                />
                <button type="submit" className="absolute right-1 top-1 p-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
                  <Mail className="w-4 h-4 text-white" />
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>

        {/* Divider */}
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          whileInView={{ opacity: 1, scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="h-px bg-linear-to-r from-transparent via-gray-700 to-transparent mb-8"
        />

        {/* Bottom Bar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0 text-sm text-gray-500"
        >
          <p>© {new Date().getFullYear()} Nexus. All rights reserved.</p>
          <div className="flex space-x-8">
            <a href="#" className="hover:text-gray-300 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-gray-300 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-gray-300 transition-colors">Cookie Policy</a>
          </div>
        </motion.div>
      </div>
    </footer>
  )
}

export default Footer