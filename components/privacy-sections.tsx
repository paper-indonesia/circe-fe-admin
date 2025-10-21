"use client"

import privacyData from '@/lib/privacy-data.json'

export function PrivacySections() {
  return (
    <div className="space-y-6">
      {/* All Sections (1-15) rendered from JSON */}
      {privacyData.sections.map((section) => (
        <div
          key={section.number}
          className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
        >
          {/* Section Header */}
          <h3 className="text-lg font-bold text-blue-900 mb-4 flex items-center gap-2">
            <span className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-700 text-sm font-bold">
              {section.number}
            </span>
            {section.title}
          </h3>

          {/* Section with Subsections (like Section 2) */}
          {(section as any).subsections && (section as any).subsections.length > 0 ? (
            <div className="space-y-4">
              {(section as any).subsections.map((subsection: any, idx: number) => (
                <div key={idx} className="space-y-2">
                  {/* Subsection Title */}
                  <h4 className="font-semibold text-gray-900 text-sm flex items-baseline gap-2">
                    <span className="text-blue-600 font-bold">
                      {subsection.letter})
                    </span>
                    {subsection.title}
                  </h4>

                  {/* Subsection Items */}
                  {subsection.items && subsection.items.length > 0 && (
                    <ul className="space-y-1.5 list-disc list-inside pl-6 text-sm text-gray-700">
                      {subsection.items.map((item: string, itemIdx: number) => (
                        <li key={itemIdx}>{item}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          ) : (
            /* Regular Section Content (intro, items, conclusion) */
            <div className="text-sm text-gray-700 leading-relaxed pl-6">
              {/* Intro text */}
              {section.intro && (
                <p className="mb-2">{section.intro}</p>
              )}

              {/* List items */}
              {section.items && section.items.length > 0 && (
                <ul className="space-y-1.5 list-disc list-inside mb-2">
                  {section.items.map((item: string, itemIdx: number) => (
                    <li key={itemIdx}>{item}</li>
                  ))}
                </ul>
              )}

              {/* Conclusion text */}
              {section.conclusion && (
                <p className="mt-2">{section.conclusion}</p>
              )}
            </div>
          )}
        </div>
      ))}

      {/* Contact Information Footer */}
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-6 text-center">
        <p className="text-sm text-gray-600 mb-2">
          Jika ada pertanyaan terkait Privacy Policy ini, silakan hubungi:
        </p>
        <a
          href="mailto:reservaofficialig@gmail.com"
          className="text-blue-600 hover:text-blue-700 font-semibold text-sm"
        >
          reservaofficialig@gmail.com
        </a>
      </div>
    </div>
  )
}
