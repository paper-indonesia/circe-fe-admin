"use client"

import tncData from '@/lib/tnc-data.json'

export function TNCSections() {
  return (
    <div className="space-y-6">
      {/* Notice Section - PEMBERITAHUAN PENTING */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-l-4 border-amber-500 p-6 rounded-lg">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
            <span className="text-white font-bold text-lg">!</span>
          </div>
          <div>
            <h3 className="text-lg font-bold text-amber-900 mb-2">
              {tncData.notice.title}
            </h3>
            <p className="text-sm text-amber-800 leading-relaxed">
              {tncData.notice.content}
            </p>
          </div>
        </div>
      </div>

      {/* All Sections (1-20) rendered from JSON */}
      {tncData.sections.map((section) => (
        <div
          key={section.number}
          className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
        >
          {/* Section Header */}
          <h3 className="text-lg font-bold text-[#6D28D9] mb-4 flex items-center gap-2">
            <span className="w-8 h-8 bg-[#EDE9FE] rounded-lg flex items-center justify-center text-[#6D28D9] text-sm font-bold">
              {section.number}
            </span>
            {section.title}
          </h3>

          {/* Section 1: DEFINISI - Special rendering for term/definition pairs */}
          {section.number === 1 && (
            <div className="space-y-3">
              {section.subsections.map((item: any, idx: number) => (
                <div
                  key={idx}
                  className="bg-gray-50 rounded-lg p-4 border border-gray-100"
                >
                  <dt className="font-semibold text-[#6D28D9] text-sm mb-1">
                    {item.term}
                  </dt>
                  <dd className="text-sm text-gray-700 leading-relaxed">
                    {item.definition}
                  </dd>
                </div>
              ))}
            </div>
          )}

          {/* Other Sections: Subsections with content */}
          {section.number !== 1 && (
            <div className="space-y-4">
              {section.subsections.map((subsection: any, idx: number) => (
                <div key={idx} className="space-y-2">
                  {/* Subsection Title */}
                  {subsection.number && subsection.title && (
                    <h4 className="font-semibold text-gray-900 text-sm flex items-baseline gap-2">
                      <span className="text-[#8B5CF6] font-bold">
                        {subsection.number}
                      </span>
                      {subsection.title}
                    </h4>
                  )}

                  {/* Subsection Content - Structured with intro, items, conclusion */}
                  <div className="text-sm text-gray-700 leading-relaxed pl-6">
                    {/* Intro text */}
                    {subsection.intro && (
                      <p className="mb-2">{subsection.intro}</p>
                    )}

                    {/* List items */}
                    {subsection.items && subsection.items.length > 0 && (
                      <ul className="space-y-1.5 list-disc list-inside mb-2">
                        {subsection.items.map((item: string, itemIdx: number) => (
                          <li key={itemIdx}>{item}</li>
                        ))}
                      </ul>
                    )}

                    {/* Conclusion text */}
                    {subsection.conclusion && (
                      <p className="mt-2">{subsection.conclusion}</p>
                    )}
                  </div>
                </div>
              ))}

              {/* If section has direct content (no subsections) */}
              {section.subsections.length === 0 && (section as any).content && (
                <div className="text-sm text-gray-700 leading-relaxed">
                  <p>{(section as any).content}</p>
                </div>
              )}
            </div>
          )}
        </div>
      ))}

      {/* Contact Information Footer */}
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-[#C4B5FD] rounded-xl p-6 text-center">
        <p className="text-sm text-gray-600 mb-2">
          Jika ada pertanyaan terkait Terms & Conditions ini, silakan hubungi:
        </p>
        <a
          href="mailto:reservaofficialig@gmail.com"
          className="text-[#8B5CF6] hover:text-[#6D28D9] font-semibold text-sm"
        >
          reservaofficialig@gmail.com
        </a>
      </div>
    </div>
  )
}
