import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
import FormDesigner from "../views/FormDesigner";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    name: "Home",
    component: FormDesigner,
    meta: {
      title: "表单设计器",
    },
  },
  {
    path: "/About",
    name: "About",
    component: () => import("@/views/About"),
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

router.beforeEach((to, from, next) => {
  if (to.meta.title) {
    document.title = to.meta.title as string;
  } else {
    document.title = "OA办公自动化";
  }
  next();
});

export default router;
