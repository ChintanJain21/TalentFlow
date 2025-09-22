import { useState, useEffect } from 'react';
import { X, Plus } from 'lucide-react';
import { useTheme } from '../../../contexts/ThemeContext';

const JobForm = ({ job = null, onSubmit, onCancel, isLoading = false }) => {
  const { isDark } = useTheme();
  
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    location: '',
    description: '',
    requirements: [''],
    tags: [''],
    salary: '',
    status: 'active'
  });
  
  const [errors, setErrors] = useState({});

  // Pre-fill form for editing
  useEffect(() => {
    if (job) {
      setFormData({
        title: job.title || '',
        company: job.company || '',
        location: job.location || '',
        description: job.description || '',
        requirements: job.requirements || [''],
        tags: job.tags || [''],
        salary: job.salary || '',
        status: job.status || 'active'
      });
    }
  }, [job]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const handleArrayChange = (field, index, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
  };

  const addArrayItem = (field) => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const removeArrayItem = (field, index) => {
    if (formData[field].length > 1) {
      setFormData(prev => ({
        ...prev,
        [field]: prev[field].filter((_, i) => i !== index)
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.company.trim()) newErrors.company = 'Company is required';
    if (!formData.location.trim()) newErrors.location = 'Location is required';

    const validRequirements = formData.requirements.filter(req => req.trim());
    const validTags = formData.tags.filter(tag => tag.trim());

    if (validRequirements.length === 0) newErrors.requirements = 'At least one requirement is needed';
    if (validTags.length === 0) newErrors.tags = 'At least one tag is needed';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const cleanData = {
      ...formData,
      slug: formData.title.toLowerCase().replace(/\s+/g, '-'),
      requirements: formData.requirements.filter(req => req.trim()),
      tags: formData.tags.filter(tag => tag.trim())
    };

    onSubmit(cleanData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      
      {/* Job Title */}
      <div>
        <label className="block text-sm font-bold text-gray-900 dark:text-gray-100 mb-2">
          Job Title *
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => handleChange('title', e.target.value)}
          className={`w-full px-4 py-3 bg-white dark:bg-gray-700 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 ${
            errors.title ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
          }`}
          placeholder="e.g. Frontend Developer"
        />
        {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
      </div>

      {/* Company & Location */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-bold text-gray-900 dark:text-gray-100 mb-2">
            Company *
          </label>
          <input
            type="text"
            value={formData.company}
            onChange={(e) => handleChange('company', e.target.value)}
            className={`w-full px-4 py-3 bg-white dark:bg-gray-700 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 ${
              errors.company ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
            }`}
            placeholder="e.g. TechCorp"
          />
          {errors.company && <p className="text-red-500 text-sm mt-1">{errors.company}</p>}
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-900 dark:text-gray-100 mb-2">
            Location *
          </label>
          <input
            type="text"
            value={formData.location}
            onChange={(e) => handleChange('location', e.target.value)}
            className={`w-full px-4 py-3 bg-white dark:bg-gray-700 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 ${
              errors.location ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
            }`}
            placeholder="e.g. Remote"
          />
          {errors.location && <p className="text-red-500 text-sm mt-1">{errors.location}</p>}
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-bold text-gray-900 dark:text-gray-100 mb-2">
          Description
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => handleChange('description', e.target.value)}
          rows={4}
          className="w-full px-4 py-3 bg-white dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
          placeholder="Job description..."
        />
      </div>

      {/* Requirements */}
      <div>
        <label className="block text-sm font-bold text-gray-900 dark:text-gray-100 mb-2">
          Requirements *
        </label>
        {formData.requirements.map((requirement, index) => (
          <div key={index} className="flex items-center space-x-2 mb-2">
            <input
              type="text"
              value={requirement}
              onChange={(e) => handleArrayChange('requirements', index, e.target.value)}
              className="flex-1 px-4 py-3 bg-white dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
              placeholder="e.g. 3+ years experience"
            />
            <button
              type="button"
              onClick={() => removeArrayItem('requirements', index)}
              className="p-3 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
              disabled={formData.requirements.length === 1}
            >
              <X size={18} />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => addArrayItem('requirements')}
          className="flex items-center space-x-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm font-medium"
        >
          <Plus size={16} />
          <span>Add Requirement</span>
        </button>
        {errors.requirements && <p className="text-red-500 text-sm mt-1">{errors.requirements}</p>}
      </div>

      {/* Tags */}
      <div>
        <label className="block text-sm font-bold text-gray-900 dark:text-gray-100 mb-2">
          Skills *
        </label>
        {formData.tags.map((tag, index) => (
          <div key={index} className="flex items-center space-x-2 mb-2">
            <input
              type="text"
              value={tag}
              onChange={(e) => handleArrayChange('tags', index, e.target.value)}
              className="flex-1 px-4 py-3 bg-white dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
              placeholder="e.g. javascript"
            />
            <button
              type="button"
              onClick={() => removeArrayItem('tags', index)}
              className="p-3 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
              disabled={formData.tags.length === 1}
            >
              <X size={18} />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => addArrayItem('tags')}
          className="flex items-center space-x-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm font-medium"
        >
          <Plus size={16} />
          <span>Add Skill</span>
        </button>
        {errors.tags && <p className="text-red-500 text-sm mt-1">{errors.tags}</p>}
      </div>

      {/* Salary & Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-bold text-gray-900 dark:text-gray-100 mb-2">
            Salary Range
          </label>
          <input
            type="text"
            value={formData.salary}
            onChange={(e) => handleChange('salary', e.target.value)}
            className="w-full px-4 py-3 bg-white dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
            placeholder="e.g. $80k - $120k"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-900 dark:text-gray-100 mb-2">
            Status
          </label>
          <select
            value={formData.status}
            onChange={(e) => handleChange('status', e.target.value)}
            className="w-full px-4 py-3 bg-white dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all text-gray-900 dark:text-gray-100"
          >
            <option value="active">Active</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>

      {/* Submit Buttons */}
      <div className="flex items-center justify-end space-x-4 pt-6 border-t-2 border-gray-200 dark:border-gray-700">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-3 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 font-medium transition-all"
          disabled={isLoading}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-bold transition-all"
          disabled={isLoading}
        >
          {isLoading ? 'Saving...' : job ? 'Update Job' : 'Create Job'}
        </button>
      </div>
    </form>
  );
};

export default JobForm;
