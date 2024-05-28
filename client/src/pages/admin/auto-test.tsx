import { SessionProvider } from "modules/Course/contexts";
import { CourseRole } from "services/models";

function Page() {
    return <>
    auto-test
    </>
}
export default function () {
    return (
        <SessionProvider allowedRoles={[CourseRole.Manager]} anyCoursePowerUser>
          <Page />
        </SessionProvider>
    );
  }
  