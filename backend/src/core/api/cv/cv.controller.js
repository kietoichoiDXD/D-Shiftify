import { ValidHttpResponse } from 'packages/handler/response/validHttp.response';
import { CVService } from 'core/modules/cv/service/cv.service';
import { getUserContext } from 'packages/authModel/module/user';

class Controller {
  constructor() {
    this.service = CVService;
  }

  createOne = async req => {
    const userId = getUserContext(req).payload.id;
    const data = await this.service.createOne({ ...req.body, userId });

    return ValidHttpResponse.toCreatedResponse(data);
  };

  findCurrent = async req => {
    const userId = getUserContext(req).payload.id;
    const data = await this.service.getCurrentCv(userId);
    return ValidHttpResponse.toOkResponse({ status: 'success', data });
  };

  findById = async req => {
    const userId = getUserContext(req).payload.id;
    const data = await this.service.getCvById(req.params.id, userId);

    return ValidHttpResponse.toOkResponse(data);
  };

  updateCV = async req => {
    const userId = getUserContext(req).payload.id;
    const data = await this.service.updateCV(req.params.id, req.body, userId);

    return ValidHttpResponse.toOkResponse(data);
  };

  getDisabilityOptions = async () => ValidHttpResponse.toOkResponse({
    statuses: [
      { id: 'none', label: 'Không có' },
      { id: 'visual_complete', label: 'Khiếm thị hoàn toàn' },
      { id: 'visual_partial', label: 'Khiếm thị không hoàn toàn' },
      { id: 'hearing', label: 'Khiếm thính' },
      { id: 'mobility', label: 'Khuyết tật vận động' },
      { id: 'other', label: 'Khác' },
    ],
    genders: [
      { id: 'male', label: 'Nam' },
      { id: 'female', label: 'Nữ' },
      { id: 'other', label: 'Khác' },
    ],
    disabilityTypes: [],
    disabilityLevels: [],
    workTimes: [
      { id: 'full_time', label: 'Toàn thời gian' },
      { id: 'part_time', label: 'Bán thời gian' },
    ],
    workModes: [
      { id: 'remote', label: 'Từ xa' },
      { id: 'onsite', label: 'Tại văn phòng' },
      { id: 'hybrid', label: 'Kết hợp' },
    ],
    softSkillOptions: [],
    hardSkillOptions: [],
    workConditions: [],
    equipment: [],
    certifications: [],
  });

  createForSheet = async req => {
    const userId = getUserContext(req).payload.id;
    const created = await this.service.createOne({ ...req.body, userId });
    const cv = Array.isArray(created) ? created[0] : created;
    return ValidHttpResponse.toCreatedResponse({
      cv_id: cv?.id,
      status: 'success',
      message: 'Tạo CV thành công',
    });
  };

  listForSheet = async req => {
    const userId = getUserContext(req).payload.id;
    const rows = await this.service.listMyCvs(userId);
    return ValidHttpResponse.toOkResponse(
      rows.map(row => ({
        id: row.id,
        expected_job: row.expectedJob,
        job_type: row.jobType,
        created_at: row.createdAt instanceof Date ? row.createdAt.toISOString() : row.createdAt,
      })),
    );
  };

  getByIdForSheet = async req => {
    const userId = getUserContext(req).payload.id;
    const cv = await this.service.getCvById(req.params.id, userId);
    return ValidHttpResponse.toOkResponse({
      id: cv.id,
      profile: {
        full_name: cv.fullName || null,
        disability_status: cv.disabilityStatus || null,
      },
      job_type: cv.jobType,
      work_mode: cv.workMode,
      mobility: cv.mobility,
      expected_job: cv.expectedJob,
      conditions: cv.conditions,
      experiences: cv.experiences,
      skills: cv.skills,
      certificates: cv.certificates,
      created_at: cv.createdAt instanceof Date ? cv.createdAt.toISOString() : cv.createdAt,
    });
  };

  updateForSheet = async req => {
    const userId = getUserContext(req).payload.id;
    const updated = await this.service.updateCV(req.params.id, req.body, userId);
    const updatedAt = updated?.updatedAt;
    return ValidHttpResponse.toOkResponse({
      status: 'success',
      message: 'Cập nhật CV thành công',
      updated_at: updatedAt instanceof Date ? updatedAt.toISOString() : updatedAt,
    });
  };

  deleteForSheet = async req => {
    const userId = getUserContext(req).payload.id;
    const data = await this.service.deleteCV(req.params.id, userId);
    return ValidHttpResponse.toOkResponse({ status: 'success', message: data.message });
  };

  preview = async req => {
    const value = req.body || {};
    const fields = [value.fullName, value.phone || value.email, value.disabilityStatus,
      value.careerGoals, value.hardSkills, value.softSkills, value.education, value.experience];
    const completenessScore = Math.round((fields.filter(item => String(item || '').trim()).length / fields.length) * 100);
    return ValidHttpResponse.toOkResponse({
      completenessScore,
      summary: `${value.fullName || 'Ứng viên'} đang xác nhận hồ sơ năng lực.`,
      warnings: completenessScore < 75 ? ['Bổ sung thêm kỹ năng và kinh nghiệm để tăng độ phù hợp.'] : [],
      sections: [],
    });
  };

}

export const CVController = new Controller();
