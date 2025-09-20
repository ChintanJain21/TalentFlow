import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const JobForm = ({ job = null, onSubmit, onCancel, isLoading = false }) => {
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

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.company.trim()) {
      newErrors.company = 'Company is required';
    }

    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    }

    // Check for empty requirements/tags
    const validRequirements = formData.requirements.filter(req => req.trim());
    const validTags = formData.tags.filter(tag => tag.trim());

    if (validRequirements.length === 0) {
      newErrors.requirements = 'At least one requirement is needed';
    }

    if (validTags.length === 0) {
      newErrors.tags = 'At least one tag is needed';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    // Clean up data
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
      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Job Title *
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => handleChange('title', e.target.value)}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
            errors.title ? 'border-red-300' : 'border-gray-300'
          }`}
          placeholder="e.g. Frontend Developer"
        />
        {errors.title && <p className="text-red-600 text-sm mt-1">{errors.title}</p>}
      </div>

      {/* Company & Location */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Company *
          </label>
          <input
            type="text"
            value={formData.company}
            onChange={(e) => handleChange('company', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.company ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="e.g. TechCorp"
          />
          {errors.company && <p className="text-red-600 text-sm mt-1">{errors.company}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Location *
          </label>
          <input
            type="text"
            value={formData.location}
            onChange={(e) => handleChange('location', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.location ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="e.g. Remote"
          />
          {errors.location && <p className="text-red-600 text-sm mt-1">{errors.location}</p>}
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Description
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => handleChange('description', e.target.value)}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Job description..."
        />
      </div>

      {/* Requirements */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Requirements *
        </label>
        {formData.requirements.map((requirement, index) => (
          <div key={index} className="flex items-center space-x-2 mb-2">
            <input
              type="text"
              value={requirement}
              onChange={(e) => handleArrayChange('requirements', index, e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g. 3+ years experience"
            />
            <button
              type="button"
              onClick={() => removeArrayItem('requirements', index)}
              className="text-red-500 hover:text-red-700"
              disabled={formData.requirements.length === 1}
            >
              <X size={18} />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => addArrayItem('requirements')}
          className="text-blue-600 hover:text-blue-700 text-sm"
        >
          + Add Requirement
        </button>
        {errors.requirements && <p className="text-red-600 text-sm mt-1">{errors.requirements}</p>}
      </div>

      {/* Tags */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tags *
        </label>
        {formData.tags.map((tag, index) => (
          <div key={index} className="flex items-center space-x-2 mb-2">
            <input
              type="text"
              value={tag}
              onChange={(e) => handleArrayChange('tags', index, e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g. javascript"
            />
            <button
              type="button"
              onClick={() => removeArrayItem('tags', index)}
              className="text-red-500 hover:text-red-700"
              disabled={formData.tags.length === 1}
            >
              <X size={18} />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => addArrayItem('tags')}
          className="text-blue-600 hover:text-blue-700 text-sm"
        >
          + Add Tag
        </button>
        {errors.tags && <p className="text-red-600 text-sm mt-1">{errors.tags}</p>}
      </div>

      {/* Salary & Status */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Salary Range
          </label>
          <input
            type="text"
            value={formData.salary}
            onChange={(e) => handleChange('salary', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="e.g. $80k - $120k"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Status
          </label>
          <select
            value={formData.status}
            onChange={(e) => handleChange('status', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="active">Active</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>

      {/* Submit Buttons */}
      <div className="flex items-center justify-end space-x-4 pt-4 border-t">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
          disabled={isLoading}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          disabled={isLoading}
        >
          {isLoading ? 'Saving...' : job ? 'Update Job' : 'Create Job'}
        </button>
      </div>
    </form>
  );
};

export default JobForm;
