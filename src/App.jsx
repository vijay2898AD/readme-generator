import React, { useState, useEffect, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';

// A template for the generated README content.
const markdownTemplates = {
  titleDescription: (title, description) => `
# ${title || 'Project Title'}

${description || 'A brief, one-sentence description of your project.'}
`,
  features: (features) => {
    const featureList = features
      .split('\n')
      .map(feat => feat.trim())
      .filter(feat => feat)
      .map(feat => `- ${feat}`)
      .join('\n');

    return `
---

## 🚀 Features
${featureList || `- Feature 1: A cool feature of your project.
- Feature 2: Another great feature that makes your project stand out.
- Feature 3: A third feature that highlights your skills.`}
`;
  },
  installation: (installation) => `
---

## 🛠️ Installation

\`\`\`bash
${installation || `# Clone the repository
git clone https://github.com/your-username/your-project.git

# Navigate to the project directory
cd your-project

# Install dependencies
npm install`}
\`\`\`
`,
  usage: (usage) => `
---

## 💡 Usage

\`\`\`bash
${usage || `# Start the application
npm start`}
\`\`\`
`,
  contributing: (contributing) => `
---

## 🤝 Contributing

${contributing || `Contributions are what make the open-source community an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (\`git checkout -b feature/AmazingFeature\`)
3. Commit your Changes (\`git commit -m 'Add some AmazingFeature'\`)
4. Push to the Branch (\`git push origin feature/AmazingFeature\`)
5. Open a Pull Request`}
`,
  license: (license) => `
---

## ✅ License

${license || `Distributed under the MIT License. See \`LICENSE\` for more information.`}
`,
  contact: (contact) => `
---

## Contact

${contact || `Your Name - your_email@example.com

Project Link: [https://github.com/your-username/your-project](https://github.com/your-username/your-project)`}
`,
};

const allSections = [
  { id: 'features', name: 'Features', component: 'InputField', placeholder: "e.g.,- Feature 1\n- Feature 2", type: 'textarea', rows: 4 },
  { id: 'installation', name: 'Installation', component: 'InputField', placeholder: "e.g., git clone ...\ncd my-project\nnpm install", type: 'textarea', rows: 6 },
  { id: 'usage', name: 'Usage', component: 'InputField', placeholder: "e.g., npm start", type: 'textarea', rows: 3 },
  { id: 'contributing', name: 'Contributing', component: 'InputField', placeholder: "Guidelines for contributing to the project.", type: 'textarea', rows: 4 },
  { id: 'license', name: 'License', component: 'InputField', placeholder: "e.g., Distributed under the MIT License.", type: 'text', rows: 1 },
  { id: 'contact', name: 'Contact', component: 'InputField', placeholder: "Your Name - email@example.com", type: 'text', rows: 1 },
];

const InputField = ({ label, name, value, onChange, placeholder, type = 'text', rows = 1, showDelete, onDelete, draggable = false, onDragStart, onDragOver, onDrop }) => (
    <div 
      className="mb-4"
      draggable={draggable}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      <div className="flex justify-between items-center mb-1 cursor-grab">
        <label className="block text-sm font-medium text-white">{label}</label>
        {showDelete && (
          <button
            onClick={onDelete}
            className="text-xs px-2 py-1 rounded-full bg-red-600 text-white hover:bg-red-700 transition-colors duration-200"
          >
            Delete
          </button>
        )}
      </div>
      {type === 'textarea' ? (
        <textarea
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          rows={rows}
          className="w-full p-2 border border-green-700 rounded-md focus:ring-green-500 focus:border-green-500 transition-all duration-200 resize-none bg-green-900 text-white"
        />
      ) : (
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="w-full p-2 border border-green-700 rounded-md focus:ring-green-500 focus:border-green-500 transition-all duration-200 bg-green-900 text-white"
        />
      )}
    </div>
  );

const CustomSectionModal = ({ onAdd, onClose }) => {
    const [customSectionTitle, setCustomSectionTitle] = useState('');

    const handleAdd = () => {
        if (customSectionTitle.trim()) {
            onAdd(customSectionTitle);
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-green-900 rounded-lg p-6 shadow-xl w-full max-w-md modal-enter">
                <h3 className="text-xl font-bold mb-4 text-white">Create Custom Section</h3>
                <p className="text-sm text-green-200 mb-4">Enter a title for your new section. Markdown headings will be automatically applied.</p>
                <input
                    type="text"
                    className="w-full p-2 border border-green-700 rounded-md mb-4 bg-green-800 text-white"
                    placeholder="e.g., Acknowledgements"
                    value={customSectionTitle}
                    onChange={(e) => setCustomSectionTitle(e.target.value)}
                />
                <div className="flex justify-end space-x-2">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-lg bg-green-700 text-white font-medium hover:bg-green-600 transition-all duration-200"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleAdd}
                        className="px-4 py-2 rounded-lg bg-green-500 text-white font-medium hover:bg-green-400 transition-all duration-200 disabled:opacity-50"
                        disabled={!customSectionTitle.trim()}
                    >
                        Add Section
                    </button>
                </div>
            </div>
        </div>
    );
};

const App = () => {
  const [markdownData, setMarkdownData] = useState({
    title: '',
    description: '',
    features: '',
    installation: '',
    usage: '',
    contributing: '',
    license: '',
    contact: ''
  });
  const [copyStatus, setCopyStatus] = useState('Copy');
  const [activeSections, setActiveSections] = useState(['titleDescription']);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [nextCustomId, setNextCustomId] = useState(0);
  const [customSectionTitles, setCustomSectionTitles] = useState({});

  const generatedMarkdown = useMemo(() => {
    let markdown = markdownTemplates.titleDescription(markdownData.title, markdownData.description);
    
    const sectionsToRender = activeSections.filter(id => id !== 'titleDescription');
    sectionsToRender.forEach(id => {
      if (markdownTemplates[id]) {
        markdown += markdownTemplates[id](markdownData[id]);
      } else if (id.startsWith('custom-')) {
        const customTitle = customSectionTitles[id] || 'Custom Section';
        const customContent = markdownData[id] || '';
        markdown += `
---

## ${customTitle}
${customContent}
`;
      }
    });
    
    return markdown.trim();
  }, [markdownData, activeSections, customSectionTitles]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setMarkdownData(prev => ({ ...prev, [name]: value }));
  };

  const addSection = (sectionId) => {
    if (!activeSections.includes(sectionId)) {
      setActiveSections(prev => [...prev, sectionId]);
      setShowAddMenu(false);
    }
  };
  
  const handleAddCustomSection = (customSectionTitle) => {
    const newId = `custom-${nextCustomId}`;
    setActiveSections(prev => [...prev, newId]);
    setMarkdownData(prev => ({ ...prev, [newId]: '' }));
    setCustomSectionTitles(prev => ({ ...prev, [newId]: customSectionTitle }));
    setNextCustomId(prev => prev + 1);
    setShowCustomModal(false);
    setShowAddMenu(false);
  };
  
  const deleteSection = (sectionId) => {
    setActiveSections(prev => prev.filter(id => id !== sectionId));
  };
  
  const handleDragStart = (e, sectionId) => {
    e.dataTransfer.setData("sectionId", sectionId);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, targetSectionId) => {
    e.preventDefault();
    const draggedSectionId = e.dataTransfer.getData("sectionId");
    const newActiveSections = [...activeSections];
    const draggedIndex = newActiveSections.indexOf(draggedSectionId);
    const targetIndex = newActiveSections.indexOf(targetSectionId);

    if (draggedIndex !== -1 && targetIndex !== -1) {
      const [removed] = newActiveSections.splice(draggedIndex, 1);
      newActiveSections.splice(targetIndex, 0, removed);
      setActiveSections(newActiveSections);
    }
  };

  const copyToClipboard = () => {
    try {
      const textarea = document.createElement('textarea');
      textarea.value = generatedMarkdown;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopyStatus('Copied!');
      setTimeout(() => setCopyStatus('Copy'), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
      setCopyStatus('Failed to Copy');
      setTimeout(() => setCopyStatus('Copy'), 2000);
    }
  };

  const downloadMarkdown = () => {
    const element = document.createElement('a');
    const file = new Blob([generatedMarkdown], { type: 'text/markdown' });
    element.href = URL.createObjectURL(file);
    element.download = 'README.md';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };
  
  return (
    <div className="min-h-screen bg-[#1F3A30] text-gray-200 flex flex-col items-center justify-center p-4 font-sans">
      <style>{`
        .markdown-body h1 {
          font-size: 2.5rem !important;
          font-weight: bold;
          margin-bottom: 0.5rem;
          color: #CCFF00;
        }
        .markdown-body h2 {
          font-size: 1.75rem !important;
          font-weight: bold;
          margin-top: 1.5rem;
          margin-bottom: 0.5rem;
          color: #90EE90;
        }
        .markdown-body p, .markdown-body li {
          font-size: 1.1rem !important;
          color: #E0E0E0;
        }
        .markdown-body code {
          background-color: #2E4E42;
          padding: 2px 4px;
          border-radius: 4px;
          color: #CCFF00;
        }
        .markdown-body pre code {
            word-wrap: break-word;
            white-space: pre-wrap;
        }
        .transition-all {
            transition-property: all;
            transition-duration: 300ms;
            transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
        }
        .hover\\:scale-\\[1\\.005\\]:hover {
            transform: scale(1.005);
        }
      `}</style>
      <div className="w-full max-w-7xl mx-auto rounded-xl shadow-2xl bg-[#037764] px-4 py-8 md:p-12 transform transition-all duration-300 hover:scale-[1.005]">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-[#CCFF00]">README Generator</h1>
          <p className="mt-2 text-lg text-[#E0E0E0]">Effortlessly create professional README files for your projects.</p>
        </div>
        <div className="flex flex-col md:flex-row gap-4 md:gap-8">
          {/* Input Section */}
          <div className="md:w-1/2 p-4 md:p-6 rounded-xl bg-[#025a4d] shadow-inner">
            <h2 className="text-2xl font-bold mb-6 text-white">Project Details</h2>
            {activeSections.map(sectionId => {
              const predefinedSection = allSections.find(s => s.id === sectionId);
              const isDraggable = sectionId !== 'titleDescription';
              const label = predefinedSection ? predefinedSection.name : customSectionTitles[sectionId];

              if (sectionId === 'titleDescription') {
                return (
                  <div key={sectionId} onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, sectionId)}>
                    <InputField
                      label="Project Title"
                      name="title"
                      value={markdownData.title}
                      onChange={handleInputChange}
                      placeholder="e.g., My Awesome Project"
                    />
                    <InputField
                      label="Description"
                      name="description"
                      value={markdownData.description}
                      onChange={handleInputChange}
                      placeholder="A brief, one-sentence description of your project."
                      type="textarea"
                      rows={2}
                    />
                  </div>
                );
              } else if (predefinedSection) {
                return (
                  <InputField
                    key={predefinedSection.id}
                    label={predefinedSection.name}
                    name={predefinedSection.id}
                    value={markdownData[predefinedSection.id]}
                    onChange={handleInputChange}
                    placeholder={predefinedSection.placeholder}
                    type={predefinedSection.type}
                    rows={predefinedSection.rows}
                    showDelete={true}
                    onDelete={() => deleteSection(predefinedSection.id)}
                    draggable={isDraggable}
                    onDragStart={(e) => handleDragStart(e, predefinedSection.id)}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, predefinedSection.id)}
                  />
                );
              } else if (sectionId.startsWith('custom-')) {
                 return (
                  <InputField
                    key={sectionId}
                    label={customSectionTitles[sectionId]}
                    name={sectionId}
                    value={markdownData[sectionId]}
                    onChange={handleInputChange}
                    placeholder="Enter your custom content here."
                    type="textarea"
                    rows={4}
                    showDelete={true}
                    onDelete={() => deleteSection(sectionId)}
                    draggable={isDraggable}
                    onDragStart={(e) => handleDragStart(e, sectionId)}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, sectionId)}
                  />
                );
              }
            })}

            <div className="mt-6 relative">
              <button
                onClick={() => setShowAddMenu(!showAddMenu)}
                className="w-full px-4 py-2 rounded-lg bg-[#187a41] text-white font-medium shadow-md hover:bg-[#024a41] transition-colors duration-200"
              >
                + Add Section
              </button>
              {showAddMenu && (
                <div className="absolute z-10 w-full mt-2 bg-[#023020] border border-[#037764] rounded-md shadow-lg">
                  <ul className="py-1">
                    {allSections.filter(s => !activeSections.includes(s.id)).map(section => (
                      <li key={section.id}>
                        <button
                          onClick={() => addSection(section.id)}
                          className="w-full text-left px-4 py-2 text-white hover:bg-[#025a4d]"
                        >
                          {section.name}
                        </button>
                      </li>
                    ))}
                    <li className="border-t border-[#025a4d] my-1"></li>
                    <li>
                      <button
                        onClick={() => setShowCustomModal(true)}
                        className="w-full text-left px-4 py-2 text-white hover:bg-[#025a4d]"
                      >
                        + Add Custom Section
                      </button>
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Preview Section */}
          <div className="md:w-1/2 p-6 rounded-xl bg-[#025a4d] shadow-inner overflow-y-auto max-h-screen">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Markdown Preview</h2>
              <div className="flex space-x-2">
                <button
                  onClick={copyToClipboard}
                  className="px-4 py-2 rounded-lg bg-[#CCFF00] text-[#1F3A30] font-medium shadow-md hover:bg-[#B3CC00] transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#CCFF00] transform active:scale-95"
                >
                  {copyStatus}
                </button>
                <button
                  onClick={downloadMarkdown}
                  className="px-4 py-2 rounded-lg bg-[#037764] text-white font-medium shadow-md hover:bg-[#025a4d] transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#037764] transform active:scale-95"
                >
                  Download
                </button>
              </div>
            </div>
            <div className="relative p-4 border border-[#025a4d] rounded-md bg-[#023020] text-[#E0E0E0] markdown-body">
              <ReactMarkdown>
                {generatedMarkdown}
              </ReactMarkdown>
            </div>
          </div>
        </div>
      </div>
      <div className="w-full max-w-7xl mx-auto rounded-xl shadow-2xl bg-[#037764] p-8 md:p-12 mt-8 text-[E0E0E0]">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-white text-[#FFEF00]">What is a README?</h2>
          <p className="mt-2 text-[#00ffef]">A guide to why a good README is essential for any project.</p>
        </div>
        <div className="prose">
          <p className="text-[#E3Eff0]">
            A <b className='text-white'>README</b> file (usually <b>`README.md`</b>) is a text document that introduces and explains a project. It is typically the first file a user or contributor will see when they visit a repository on platforms like GitHub or GitLab. Its primary purpose is to provide an overview, instructions, and context for your code.
          </p>
          <p className="text-[#E3Eff0]">
            Think of a README as your project's welcome mat and instruction manual combined. It answers the fundamental questions that anyone encountering your work might have:
          </p>
          <ul className="list-disc list-inside text-[#FFEF00]">
            <li>What is this project and what does it do?</li>
            <li>Why is it useful?</li>
            <li>How do I install and use it?</li>
            <li>Who can I contact for help?</li>
            </ul>
        </div>
        <hr className="my-8 border-[#025a4d]" />
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-[#FFEF00]">Why is a README Important?</h2>
        </div>
        <div className="prose">
          <p className="text-[#E3Eff0]">
            A well-written README is crucial for a project's success, especially in open-source development. It makes your project more accessible and professional.
          </p>
          <ul className="list-disc list-inside text-[#E3Eff0]">
            <li>
              <b className='text-[#FFEF00]'>Professionalism:</b> A good README makes your project look polished and shows that you take your work seriously. It's often the first thing a potential employer or collaborator will look at.
            </li>
            <li>
              <b className='text-[#FFEF00]'>Attracts Contributors:</b> Clear and comprehensive documentation lowers the barrier to entry for new contributors. When people can easily understand your project, they are more likely to get involved and contribute.
            </li>
            <li>
              <b className='text-[#FFEF00]'>Saves Time:</b> By providing detailed instructions and answers to common questions, you reduce the need to respond to repetitive queries, saving you time and effort.
            </li>
          </ul>
        </div>
      </div>
      {showCustomModal && (
        <CustomSectionModal
          onAdd={handleAddCustomSection}
          onClose={() => {
            setShowCustomModal(false);
          }}
        />
      )}
      <footer className="mt-8 text-center text-sm text-[white]">
          &copy; {new Date().getFullYear()} README Generator. All rights reserved.
        </footer>
        <footer className="mt-2 text-center text-sm text-[#00ffef]">
          Built with ❤️ by Vijay
        </footer>
    </div>
  );
};

export default App;
