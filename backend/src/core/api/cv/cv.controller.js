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
