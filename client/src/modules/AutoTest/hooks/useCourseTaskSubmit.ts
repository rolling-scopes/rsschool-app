import { Form } from 'antd';
import { CourseTaskDetailedDto, CourseTaskDetailedDtoTypeEnum } from 'api';
import snakeCase from 'lodash/snakeCase';
import { FilesService } from 'services/files';

export function useCourseTaskSubmit(courseTask: CourseTaskDetailedDto) {
  const [form] = Form.useForm();

  // TODO: values types
  const uploadIpynbFile = async (values: any) => {
    const filesService = new FilesService();
    const fileData = await readFile(values.upload.file);
    const { s3Key } = await filesService.uploadFile('', fileData);
    return s3Key;
  };

  const collectData = async (values: any) => {
    switch (courseTask.type) {
      case CourseTaskDetailedDtoTypeEnum.Ipynb: {
        const s3Key = await uploadIpynbFile(values);
        return {
          s3Key,
          taskName: snakeCase(courseTask.name),
        };
      }

      case CourseTaskDetailedDtoTypeEnum.Selfeducation: {
        return Object.entries(values)
          .filter(([key]) => /answer/.test(key))
          .map(([key, value]) => {
            const [, index] = key.match(/answer-(.*)$/) || [];
            return { index: Number(index), value };
          });
      }

      case CourseTaskDetailedDtoTypeEnum.Codewars: {
        return {
          deadline: courseTask.studentEndDate,
        };
      }

      case CourseTaskDetailedDtoTypeEnum.Jstask:
      case CourseTaskDetailedDtoTypeEnum.Kotlintask:
      case CourseTaskDetailedDtoTypeEnum.Objctask:
        return {
          githubRepoName: courseTask.githubRepoName,
          sourceGithubRepoUrl: courseTask.sourceGithubRepoUrl,
        };

      case CourseTaskDetailedDtoTypeEnum.Cvmarkdown:
      case CourseTaskDetailedDtoTypeEnum.Cvhtml:
        return {};

      default:
        return null;
    }
  };

  return { form, collectData };
}

function readFile(file: any) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsText(file?.originFileObj, 'utf-8');
    reader.onload = ({ target }) => resolve(target ? (target.result as string) : '');
    reader.onerror = e => reject(e);
  });
}
